const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { key, password } = event;
  const wxContext = cloud.getWXContext();

  if (!key || !password) {
    return { success: false, error: '项目key和密码不能为空' };
  }

  try {
    // 查找项目
    const projectRes = await db.collection('projects').where({ key }).get();

    if (projectRes.data.length === 0) {
      return { success: false, error: '项目不存在' };
    }

    const project = projectRes.data[0];

    // 验证密码
    if (!bcrypt.compareSync(password, project.password)) {
      return { success: false, error: '密码错误' };
    }

    // 检查项目状态
    if (project.status !== 0) {
      return { success: false, error: '项目已结束' };
    }

    // 检查截止时间
    if (project.deadline && new Date(project.deadline) < new Date()) {
      return { success: false, error: '项目已过截止时间' };
    }

    // 获取车辆列表
    const vehiclesRes = await db.collection('vehicles')
      .where({ projectId: project._id })
      .get();

    // 隐藏密码后返回
    delete project.password;

    return {
      success: true,
      project,
      vehicles: vehiclesRes.data,
    };
  } catch (e) {
    console.error('加入项目失败', e);
    return { success: false, error: '加入项目失败' };
  }
};