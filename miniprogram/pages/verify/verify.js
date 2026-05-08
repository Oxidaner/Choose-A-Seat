// miniprogram/pages/verify/verify.js
const { callFunction } = require('../../utils/cloud');

Page({
  data: {
    key: '',
    password: '',
    loading: false,
  },

  onLoad(options) {
    this.setData({ key: options.key });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async onVerify() {
    const { key, password } = this.data;

    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await callFunction('joinProject', { key, password });

      if (result.success) {
        const app = getApp();
        app.globalData.currentProject = result.project;
        app.globalData.currentVehicles = result.vehicles;

        wx.showToast({ title: '验证成功', icon: 'success' });

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/vehicles/vehicles',
          });
        }, 1000);
      } else {
        wx.showToast({ title: result.error, icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '验证失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
