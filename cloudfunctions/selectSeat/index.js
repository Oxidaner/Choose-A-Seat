const cloud = require('wx-server-sdk');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { vehicleId, seatId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!vehicleId || !seatId) {
    return { success: false, error: '参数错误' };
  }

  try {
    // 使用事务保证原子性
    const transaction = await db.startTransaction();

    // 1. 检查座位状态
    const vehicleRes = await transaction.collection('vehicles').doc(vehicleId).get();
    if (!vehicleRes.data) {
      await transaction.rollback();
      return { success: false, error: '车辆不存在' };
    }

    const vehicle = vehicleRes.data;
    const seat = vehicle.seats.find(s => s.id === seatId);

    if (!seat) {
      await transaction.rollback();
      return { success: false, error: '座位不存在' };
    }

    if (seat.status !== 0) {
      await transaction.rollback();
      return { success: false, error: '座位已被选择' };
    }

    // 2. 更新座位状态
    const seatIndex = vehicle.seats.findIndex(s => s.id === seatId);
    vehicle.seats[seatIndex] = {
      ...seat,
      status: 1,
      userId: openid,
    };

    await transaction.collection('vehicles').doc(vehicleId).update({
      data: {
        seats: vehicle.seats,
      },
    });

    // 3. 记录选座历史
    await transaction.collection('selections').add({
      data: {
        projectId: vehicle.projectId,
        vehicleId,
        seatId,
        userId: openid,
        selectedAt: new Date(),
        status: 0,
      },
    });

    await transaction.commit();

    return { success: true };
  } catch (e) {
    console.error('选座失败', e);
    return { success: false, error: '选座失败，请重试' };
  }
};
