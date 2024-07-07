const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid Email"],
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    photo: { type: String },
    cover: { type: String },
    bio: { type: String },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    favouriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    confirmPassword: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginTimestamps: [{ type: Date }],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
