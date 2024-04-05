var mongoose = require("mongoose");
var Comment = require("./commentModel");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  username: {
    type: String,
    required: true,
    default: "Anonymous"
  },
  profilePicture: {
    type: String,
    required: false
  },
  postTitle: {
    type: String,
    required: true
  },
  postContent: {
    type: String,
    required: true
  },
  postTag: {
    type: String,
    require: true
  },
  upvotes: {
    type: Array,
    required: false,
    default: 0
  },
  downvotes: {
    type: Array,
    required: false,
    default: 0
  },

  comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
  }],

  shares: {
    type: Array,
    required: true,
    default: 0
  },
});

module.exports = mongoose.model("Post", PostSchema);
