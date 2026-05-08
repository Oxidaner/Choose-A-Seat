// miniprogram/components/seat-grid/seat-grid.js
const { SEAT_STATUS, SEAT_COLORS } = require('../../utils/constants');

Component({
  properties: {
    seats: {
      type: Array,
      value: [],
    },
    selectedSeat: {
      type: String,
      value: null,
    },
  },

  data: {
    SEAT_STATUS,
    SEAT_COLORS,
  },

  methods: {
    onSeatTap(e) {
      const seat = e.currentTarget.dataset.seat;

      if (seat.status !== 0) {
        return;
      }

      this.triggerEvent('select', { seat });
    },

    getSeatStyle(seat) {
      const color = this.data.SEAT_COLORS[seat.status] || '#DDD';
      return `background: ${color}`;
    },

    getSeatText(seat) {
      if (seat.status === -1) {
        return '司机';
      }
      if (seat.status === 1 || seat.status === 2) {
        return seat.userId ? '已选' : '';
      }
      return seat.id;
    },
  },
});
