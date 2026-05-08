export const SEAT_STATUS = {
  AVAILABLE: 0,    // 可选
  SELECTED: 1,     // 已选
  ASSIGNED: 2,     // 管理员分配
  DISABLED: -1,    // 不可选
};

export const SEAT_COLORS = {
  [SEAT_STATUS.AVAILABLE]: '#4CAF50',  // 绿色
  [SEAT_STATUS.SELECTED]: '#E91E63',    // 粉色
  [SEAT_STATUS.ASSIGNED]: '#FF9800',   // 橙色
  [SEAT_STATUS.DISABLED]: '#DDD',      // 灰色
};

export const SEAT_LABELS = ['A', 'B', 'C', 'D']; // 列标签

export const PROJECT_STATUS = {
  ACTIVE: 0,      // 进行中
  ENDED: 1,       // 已结束
  ARCHIVED: 2,    // 已归档
};