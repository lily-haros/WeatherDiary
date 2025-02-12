/* Note is a model of our own observation of the days weather
types of variables might still change */
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    date: String,
    temperature: Number,
    comment: String
});

module.exports = mongoose.model("Note", noteSchema);