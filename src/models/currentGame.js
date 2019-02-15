const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currentGame = new Schema({
  createdAt: Date,
  timePlayed: Number,
  currentTurn: [{type: Schema.ObjectId, ref: "Player"}]
});

module.exports = mongoose.model("CurrentGame", currentGame);
