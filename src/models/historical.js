const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalSchema = new Schema({
    name : String,
    // startTime: { type: Date, default: Date.now }
    // endTime: { type: Date, default: Date.now }
    turns: Number,
    accuracy: Number,
    status: Boolean,
    userId: String
})

module.exports = mongoose.model('Historical', historicalSchema)