// miniprogram/pages/admin/projects/list.js
const app = getApp();
const { callFunction } = require('../../../../utils/cloud');

Page({
  data: {
    projects: [],
    loading: false,
  },

  async onLoad() {
    await this.loadProjects();
  },

  async loadProjects() {
    this.setData({ loading: true });

    try {
      const result = await callFunction('getMyProjects', {});
      if (result.success) {
        this.setData({ projects: result.projects });
      }
    } catch (e) {
      console.error('加载项目失败', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  onCreateProject() {
    wx.navigateTo({
      url: '/pages/admin/projects/create',
    });
  },

  onProjectTap(e) {
    const project = e.currentTarget.dataset.project;
    app.globalData.currentProject = project;

    wx.navigateTo({
      url: '/pages/admin/projects/detail',
    });
  },
});
