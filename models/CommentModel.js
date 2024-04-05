var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  username: {
    type: String,
    required: true,
    default: "Anonymous",
  },
  profilePicture: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
