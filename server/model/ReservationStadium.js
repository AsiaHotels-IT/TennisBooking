const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const Schema = mongoose.Schema

const ReservationStadiumSchema = mongoose.Schema({
    reservID: {
        type: Number,
        unique: true
    },
    memberID: {
        type: mongoose.Schema.Types.Number,
        ref: 'Member',
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
    receiptNumber: {
        type: String,
        default: null,  // ค่าเริ่มต้นไม่มีเลขใบเสร็จ
    },
    receiptDate: {
        type: Date,
        default: null,
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    received: {
        type: Number
    },
    changeVal: {
        type: Number
    }
})

ReservationStadiumSchema.plugin(AutoIncrement, {inc_field: "reservID"});
module.exports = mongoose.model("Reservation", ReservationStadiumSchema);