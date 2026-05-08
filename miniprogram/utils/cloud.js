const cloud = wx.cloud;

export function initCloud() {
  return cloud.init({
    env: 'choose-a-seat-xxxx', // 替换为实际云环境ID
    traceUser: true,
  });
}

export async function callFunction(name, data) {
  try {
    const result = await cloud.callFunction({
      name,
      data
    });
    return result.result;
  } catch (e) {
    console.error('云函数调用失败:', name, e);
    throw e;
  }
}

export async function getOpenId() {
  try {
    const result = await cloud.callFunction({
      name: 'getOpenId'
    });
    return result.result.openid;
  } catch (e) {
    console.error('获取openid失败', e);
    return null;
  }
}