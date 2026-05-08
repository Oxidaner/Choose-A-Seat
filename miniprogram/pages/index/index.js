// miniprogram/pages/index/index.js
Page({
  data: {
    key: '',
    loading: false,
  },

  onKeyInput(e) {
    this.setData({
      key: e.detail.value.toUpperCase(),
    });
  },

  onJoinProject() {
    const { key } = this.data;

    if (!key || key.length !== 6) {
      wx.showToast({ title: '请输入6位项目key', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/verify/verify?key=${key}`,
    });
  },
});
