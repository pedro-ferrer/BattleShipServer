const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currentGame = new Schema({
  createdAt: Date,
  timePlayed: Number,
  user: [{type: Schema.ObjectId, ref: "User"}]
});

module.exports = mongoose.model("CurrentGame", currentGame);
