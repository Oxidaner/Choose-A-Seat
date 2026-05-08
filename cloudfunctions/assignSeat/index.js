const cloud = require('wx-server-sdk');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { vehicleId, seatId, targetUserId } = event;
  const wxContext = cloud.getWXContext();
  const adminId = wxContext.OPENID;

  if (!vehicleId || !seatId || !targetUserId) {
    return { success: false, error: '参数错误' };
  }

  try {
    const transaction = await db.startTransaction();

    // 1. 验证管理员权限
    const vehicleRes = await transaction.collection('vehicles').doc(vehicleId).get();
    const vehicle = vehicleRes.data;

    const projectRes = await transaction.collection('projects').doc(vehicle.projectId).get();
    if (projectRes.data.createdBy !== adminId) {
      await transaction.rollback();
      return { success: false, error: '无管理员权限' };
    }

    // 2. 检查座位
    const seatIndex = vehicle.seats.findIndex(s => s.id === seatId);
    if (seatIndex === -1) {
      await transaction.rollback();
      return { success: false, error: '座位不存在' };
    }

    const seat = vehicle.seats[seatIndex];
    if (seat.status === -1) {
      await transaction.rollback();
      return { success: false, error: '该座位不可选' };
    }

    // 3. 如果座位已有用户，先释放原座位
    if (seat.userId) {
      const oldSeatIndex = vehicle.seats.findIndex(s => s.id === seatId);
      vehicle.seats[oldSeatIndex] = { ...seat, status: 0, userId: null };
    }

    // 4. 分配新座位
    vehicle.seats[seatIndex] = {
      ...seat,
      status: 2, // 管理员分配
      userId: targetUserId,
    };

    await transaction.collection('vehicles').doc(vehicleId).update({
      data: { seats: vehicle.seats },
    });

    // 5. 记录
    await transaction.collection('selections').add({
      data: {
        projectId: vehicle.projectId,
        vehicleId,
        seatId,
        userId: targetUserId,
        assignedBy: adminId,
        selectedAt: new Date(),
        status: 0,
      },
    });

    // 6. 发送通知
    await transaction.collection('notifications').add({
      data: {
        userId: targetUserId,
        type: 'seat_assigned',
        title: '座位被管理员调整',
        content: `您的座位已被管理员调整为 ${seatId}`,
        read: false,
        createdAt: new Date(),
      },
    });

    await transaction.commit();

    return { success: true };
  } catch (e) {
    console.error('分配座位失败', e);
    return { success: false, error: '分配座位失败' };
  }
};