const mongoose = require('mongoose');

const cancelReservationSchema = new mongoose.Schema({
    reservID: {
        type: Number,
        required: true,
        unique: true
    },
    memberID: {
        type: mongoose.Schema.Types.Number,
        ref: 'Member'
    },
    cusName: {
        type: String,
        maxlenght: 100,
        required: true
    },
    cusTel: {
        type: String,
        maxlength: 10,
        required: true
    },
    reservDate: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['จองแล้ว', 'ใช้งานแล้ว'],
        default: 'จองแล้ว'
    },
    paymentMethod: {
      type: String,
      enum: ['ยังไม่ชำระเงิน','เงินสด', 'โอนผ่านธนาคาร'],
      default: 'ยังไม่ชำระเงิน'
    },
    refPerson:{
        type: String,
        maxlength: 100,
        default: 'ไม่มี'
    },
    amount: {
        type: Number
    },
    cancelDate: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('CancelReservation', cancelReservationSchema);