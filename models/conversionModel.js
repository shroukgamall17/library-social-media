const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reciver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const conversation = mongoose.model("Conversation", conversationSchema);
module.exports = {
  conversation,
};
