const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const authController = require("../controllers/authController.js");
const postController = require("../controllers/postController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "postImages");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  upload.single("image"),
  authController.auth,
  //authController.restrictTo("admin", "user"),
  postController.createPost
);
router.get(
  "/",
  // authController.auth,
  // authController.restrictTo("admin", "user"),
  postController.getAllPosts
);

router.get(
  "/pagination",
  // authController.auth,
  // authController.restrictTo("admin", "user"),
  postController.getTwentyPostForPage
);

router.post(
  "/like/:userId/:postId",
  // authController.auth,
  //authController.restrictTo("admin", "user"),
  postController.likePost
);
router.post(
  "/dislike/:userId/:postId",
  //authController.auth,
  //authController.restrictTo("admin", "user"),
  postController.dislikePost
);
router.post(
  "/save/:userId/:postId",
  //authController.auth,
  //authController.restrictTo("admin", "user"),
  postController.savePost
);
router.post(
  "/unsave/:userId/:postId",
  //authController.auth,
  //authController.restrictTo("admin", "user"),
  postController.unSavePost
);
router.get("/:id", postController.getUserPosts);
router.get(
  "/single/:id",
  //authController.auth,
  postController.getPostById
);
router.delete(
  "/:id",
  // authController.auth,
  postController.deletePost
);
router.patch(
  "/:id",
  //authController.auth,
  //authController.restrictTo("admin", "user"),
  upload.single("photo"),
  postController.updatePost
);
module.exports = router;
