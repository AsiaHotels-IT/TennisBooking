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
        ref: 'member',
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
        enum: ['จองแล้ว', 'ยกเลิก', 'ใช้งานแล้ว'],
        default: 'จองแล้ว'
    },
    paymentMethod: {
      type: String,
      enum: ['เงินสด', 'โอนผ่านธนาคาร'],
      required: true
    },
    amount: {
        type: Number
    }
})

ReservationStadiumSchema.plugin(AutoIncrement, {inc_field: "reservID"});
module.exports = mongoose.model("Reservation", ReservationStadiumSchema);