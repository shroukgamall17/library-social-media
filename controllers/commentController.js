const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const mongoose = require("mongoose");
const { createNotification } = require("./notificationController");
const User = require("../models/userModel");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    // console.log(req.body);
    const { userId, description, postId } = req.body;
    //console.log(postId)
    const comment = await Comment.create({   
      userId,
      description,
      postId,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    const post = await Post.findById(postId);
    console.log(post)

      // Fetch the user's details
      const commentingUser = await User.findById(userId).select('name');
      if (!commentingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const userName = commentingUser.name;
    const postOwnerId = post.userId;
    //await createNotification(userId, postOwnerId, 'comment', `${userName} commented on your post`)
    if (userId !== postOwnerId.toString()) {
      await createNotification(userId, postOwnerId, 'comment', `${userName} commented on your post`);
    }
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    // const comments = await Comment.find().populate("userId").populate("postId");
    const comments = await Comment.find();
    console.log(comments);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments for a post
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).populate(
      "userId",
      "username"
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { description } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { description },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await Post.findByIdAndUpdate(deletedComment.postId, {
      $pull: { comments: deletedComment._id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
   
    const { commentId } = req.params;
    const { userId } = req.body;
    //console.log(userId)
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
   //console.log(updatedComment)
    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = await Comment.findById(commentId);
    //console.log(comment)
    const commentOwnerId = comment.userId;
    console.log(commentOwnerId)

    const likingUser = await User.findById(userId).select('name');
    if (!likingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = likingUser.name;
    //await createNotification(userId, commentOwnerId, 'like', `${userName} liked on your comment`)

    if (userId !== commentOwnerId.toString()) {
      await createNotification(userId, commentOwnerId, 'like', `${userName} liked your comment`);
    }
    
    res.status(200).json({
      message: "Comment liked successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a comment
exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    console.log(updatedComment);
    res.status(200).json({
      message: "Comment unliked successfully",
      updatedComment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
