const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const Schema = mongoose.Schema

const memberSchema = mongoose.Schema({
    cusName: {
        type: String,
        maxlength: 20
    },
    cusSurname: {
        type: String,
        maxlength: 20
    },
    cusTel: {
        type: String,
        maxlength: 10
    },
    memberPoint: {
        type: Number,
        default: 0
    },
    memberStart: {
        type: Date,
        default: Date.now
    },
    reservationBefore: {
        type: mongoose.Schema.Types.Number,
        ref: 'ResurvationStadium'
    }
});

memberSchema.plugin(AutoIncrement, {inc_field: "memberID"});
module.exports = mongoose.model("Member", memberSchema);