// miniprogram/pages/vehicles/vehicles.js
const app = getApp();

Page({
  data: {
    project: null,
    vehicles: [],
  },

  onLoad() {
    const project = app.globalData.currentProject;
    const vehicles = app.globalData.currentVehicles || [];

    this.setData({ project, vehicles });
  },

  onSelectVehicle(e) {
    const vehicle = e.currentTarget.dataset.vehicle;

    app.globalData.currentVehicle = vehicle;

    wx.navigateTo({
      url: '/pages/seats/seats',
    });
  },
});
