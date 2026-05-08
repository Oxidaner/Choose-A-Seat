const cloud = require('wx-server-sdk');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 根据模板生成座位
function generateSeats(templateType, totalSeats) {
  const labels = ['A', 'B', 'C', 'D'];
  const seats = [];
  const rows = Math.ceil(totalSeats / 4);

  let seatCount = 0;
  for (let row = 1; row <= rows && seatCount < totalSeats; row++) {
    for (let col = 1; col <= 4 && seatCount < totalSeats; col++) {
      // 第一排左侧为司机位
      const isDriver = row === 1 && col === 1;
      seats.push({
        id: `${labels[col - 1]}${row}`,
        label: `${labels[col - 1]}${row}`,
        row,
        col,
        isDriver,
        isSelectable: !isDriver,
        status: isDriver ? -1 : 0,
        userId: null,
      });
      seatCount++;
    }
  }
  return seats;
}

exports.main = async (event, context) => {
  const { projectId, name, templateType, totalSeats } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 验证管理员权限（项目创建者）
  const projectRes = await db.collection('projects').doc(projectId).get();
  if (!projectRes.data || projectRes.data.createdBy !== openid) {
    return { success: false, error: '无权限' };
  }

  if (!name || !templateType) {
    return { success: false, error: '车辆名称和模板类型不能为空' };
  }

  try {
    const seats = generateSeats(templateType, totalSeats || 45);

    const vehicle = {
      projectId,
      name,
      templateType,
      totalSeats: seats.length,
      seats,
      createdAt: new Date(),
    };

    const result = await db.collection('vehicles').add({ data: vehicle });

    return {
      success: true,
      vehicle: {
        _id: result._id,
        name,
        templateType,
        totalSeats: seats.length,
      },
    };
  } catch (e) {
    console.error('创建车辆失败', e);
    return { success: false, error: '创建车辆失败' };
  }
};
