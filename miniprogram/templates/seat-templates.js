export const SEAT_TEMPLATES = {
  'bus-45': {
    name: '45座大巴',
    rows: 11,
    cols: 4,
    driverRow: 0,
    disabledSeats: [], // 可在此添加不可选座位
  },
};

export function generateSeats(templateType) {
  const template = SEAT_TEMPLATES[templateType];
  if (!template) return [];

  const seats = [];
  const labels = ['A', 'B', 'C', 'D'];

  for (let row = 1; row <= template.rows; row++) {
    for (let col = 1; col <= template.cols; col++) {
      const isDriver = row === template.driverRow;
      const seatId = `${labels[col - 1]}${row}`;

      seats.push({
        id: seatId,
        label: seatId,
        row,
        col,
        isDriver,
        isSelectable: !isDriver,
        status: isDriver ? -1 : 0,
        userId: null,
      });
    }
  }

  return seats;
}

export function getSeatLabel(seatId) {
  const label = seatId.charAt(0);
  const row = parseInt(seatId.substring(1));
  const labelMap = {
    'A': '左1（靠窗）',
    'B': '左2（靠过道）',
    'C': '右1（靠过道）',
    'D': '右2（靠窗）',
  };
  return `${labelMap[label]} · 第${row}排`;
}