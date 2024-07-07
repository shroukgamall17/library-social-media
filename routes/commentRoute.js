const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Create a new comment
router.post("/", commentController.createComment);

// Get all comments
router.get("/", commentController.getAllComments);

// Get all comments for a post
router.get("/post/:postId", commentController.getCommentsByPostId);

// Update a comment
router.put("/:commentId", commentController.updateComment);

// Delete a comment
router.delete("/:commentId", commentController.deleteComment);

// Like a comment
router.post("/like/:commentId", commentController.likeComment);

// Unlike a comment
router.post("/unlike/:commentId", commentController.unlikeComment);

module.exports = router;
