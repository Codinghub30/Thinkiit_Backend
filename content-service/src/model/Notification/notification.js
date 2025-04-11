const mongoose = require("mongoose");

const notification = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    createby: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notification);
module.exports = Notification;
