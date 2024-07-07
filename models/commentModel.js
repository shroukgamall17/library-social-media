// models/comment.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
