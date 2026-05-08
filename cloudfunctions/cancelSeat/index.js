const cloud = require('wx-server-sdk');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { vehicleId, seatId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const transaction = await db.startTransaction();

    // 1. 检查座位状态
    const vehicleRes = await transaction.collection('vehicles').doc(vehicleId).get();
    const vehicle = vehicleRes.data;
    const seatIndex = vehicle.seats.findIndex(s => s.id === seatId);

    if (seatIndex === -1) {
      await transaction.rollback();
      return { success: false, error: '座位不存在' };
    }

    const seat = vehicle.seats[seatIndex];

    // 只能取消自己的座位
    if (seat.userId !== openid) {
      await transaction.rollback();
      return { success: false, error: '只能取消自己的座位' };
    }

    // 2. 更新座位状态
    vehicle.seats[seatIndex] = {
      ...seat,
      status: 0,
      userId: null,
    };

    await transaction.collection('vehicles').doc(vehicleId).update({
      data: { seats: vehicle.seats },
    });

    // 3. 更新选座记录
    await transaction.collection('selections').where({
      vehicleId,
      seatId,
      userId: openid,
      status: 0,
    }).update({
      data: { status: 1 }, // 取消
    });

    await transaction.commit();

    return { success: true };
  } catch (e) {
    console.error('取消选座失败', e);
    return { success: false, error: '取消选座失败' };
  }
};
