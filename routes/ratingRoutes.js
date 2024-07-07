const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const ratingController = require("../controllers/ratingController");

router.post(
  "/:userId/:bookId",
  authController.auth,
  authController.restrictTo("admin", "user"),
  ratingController.addRating
);

router.get("/:id/reviews/first-five", ratingController.getFirstFiveReviews);

router.get("/:id/reviews/all", ratingController.getAllReviews);
router.delete("/:userId/:reviewId", ratingController.deleteReview);

module.exports = router;
