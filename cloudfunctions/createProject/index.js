const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 生成6位项目key
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

exports.main = async (event, context) => {
  const { name, password, deadline } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!name || !password) {
    return { success: false, error: '项目名称和密码不能为空' };
  }

  try {
    // 生成唯一key
    let key;
    let keyExists = true;
    while (keyExists) {
      key = generateKey();
      const exist = await db.collection('projects').where({ key }).count();
      keyExists = exist.total > 0;
    }

    // 密码哈希
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 创建项目
    const project = {
      name,
      key,
      password: hashedPassword,
      deadline: deadline ? new Date(deadline) : null,
      createdBy: openid,
      createdAt: new Date(),
      status: 0, // 进行中
    };

    const result = await db.collection('projects').add({ data: project });

    return {
      success: true,
      project: {
        _id: result._id,
        name,
        key,
        deadline: project.deadline,
        status: project.status,
      },
    };
  } catch (e) {
    console.error('创建项目失败', e);
    return { success: false, error: '创建项目失败' };
  }
};
