var mongoose = require("mongoose");
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
    type: Number, // Corrected type
    default: 0
  },
  downvotes: {
    type: Number, // Corrected type
    default: 0
  },
  votes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
  }]
});

module.exports = mongoose.model("Post", PostSchema);
