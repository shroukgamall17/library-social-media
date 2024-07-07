const Rating = require("../models/ratingModel");
const Book = require("../models/bookModel");
const User = require("../models/userModel");

const addRating = async (req, res) => {
  const { userId, bookId } = req.params;
  const { rating, review } = req.body;
  // console.log(req.params);
  try {
    const book = await Book.findById(bookId);
    const user = await User.findById(userId);

    if (!book || !user) {
      return res.status(404).json({ error: "Book or User not found" });
    }

    const newRating = new Rating({
      book: bookId,
      user: userId,
      rating,
      review,
    });

    await newRating.save();

    res
      .status(201)
      .json({ message: "Rating added successfully", rating: newRating });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFirstFiveReviews = async (req, res) => {
  const bookId = req.params.id;
  // console.log(bookId);

  try {
    const reviews = await Rating.find({ book: bookId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "_id name photo")
      .exec();

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching first 5 reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllReviews = async (req, res) => {
  const bookId = req.params.id;

  try {
    const reviews = await Rating.find({ book: bookId })
      .populate("user", "_id name photo")
      .exec();
    console.log(reviews);
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { userId, reviewId } = req.params;

    const review = await Rating.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this review" });
    }

    await Rating.deleteOne({ _id: reviewId });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
module.exports = {
  addRating,
  getFirstFiveReviews,
  getAllReviews,
  deleteReview,
};
