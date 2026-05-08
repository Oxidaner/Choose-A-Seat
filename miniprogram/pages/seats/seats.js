// miniprogram/pages/seats/seats.js
const app = getApp();
const { callFunction } = require('../../utils/cloud');
const { getSeatLabel } = require('../../templates/seat-templates');

Page({
  data: {
    project: null,
    vehicle: null,
    seats: [],
    selectedSeat: null,
    loading: false,
  },

  onLoad() {
    const vehicle = app.globalData.currentVehicle;
    const project = app.globalData.currentProject;
    if (vehicle) {
      this.setData({
        vehicle,
        project,
        seats: vehicle.seats || [],
      });
    }
  },

  onSeatSelect(e) {
    const { seat } = e.detail;
    this.setData({ selectedSeat: seat });
  },

  async onConfirmSelect() {
    const { vehicle, selectedSeat } = this.data;
    if (!selectedSeat) {
      wx.showToast({ title: '请先选择座位', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await callFunction('selectSeat', {
        vehicleId: vehicle._id,
        seatId: selectedSeat.id,
      });

      if (result.success) {
        wx.showToast({ title: '选座成功', icon: 'success' });

        const seats = this.data.seats.map(s => {
          if (s.id === selectedSeat.id) {
            return { ...s, status: 1, userId: app.globalData.openid };
          }
          return s;
        });

        this.setData({ seats, selectedSeat: null });

        app.globalData.currentVehicle = { ...vehicle, seats };
      } else {
        wx.showToast({ title: result.error, icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '选座失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  getSeatLabel,
});
