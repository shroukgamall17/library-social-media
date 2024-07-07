const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    title: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String, required: true },
    Pdf: { type: String },
    cover: { type: String },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const bookModel = mongoose.model("Book", bookSchema);
module.exports = bookModel;
