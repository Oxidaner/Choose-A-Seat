// miniprogram/pages/admin/login/login.js
const app = getApp();
const { callFunction } = require('../../../utils/cloud');

Page({
  data: {
    adminKey: '',
    loading: false,
  },

  onAdminKeyInput(e) {
    this.setData({ adminKey: e.detail.value });
  },

  async onLogin() {
    const { adminKey } = this.data;

    if (!adminKey) {
      wx.showToast({ title: '请输入管理员密钥', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await callFunction('adminLogin', { adminKey });

      if (result.success) {
        app.globalData.isAdmin = true;
        app.globalData.adminKey = adminKey;

        wx.showToast({ title: '登录成功', icon: 'success' });

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/admin/projects/list',
          });
        }, 1000);
      } else {
        wx.showToast({ title: result.error, icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
