// miniprogram/pages/my-seat/my-seat.js
const app = getApp();
const { callFunction } = require('../../utils/cloud');
const { getSeatLabel } = require('../../templates/seat-templates');

Page({
  data: {
    selections: [],
    loading: false,
  },

  async onLoad() {
    await this.loadMySelections();
  },

  async onShow() {
    await this.loadMySelections();
  },

  async loadMySelections() {
    const openid = app.globalData.openid;
    if (!openid) return;

    this.setData({ loading: true });

    try {
      const result = await callFunction('getSelections', { userId: openid });

      if (result.success) {
        this.setData({ selections: result.selections });
      }
    } catch (e) {
      console.error('加载选座记录失败', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  async onCancelSeat(e) {
    const { vehicleId, seatId } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个座位吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await callFunction('cancelSeat', { vehicleId, seatId });

            if (result.success) {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.loadMySelections();
            } else {
              wx.showToast({ title: result.error, icon: 'none' });
            }
          } catch (e) {
            wx.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      },
    });
  },

  getSeatLabel,
});
