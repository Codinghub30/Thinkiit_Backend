const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketID: {
      type: String,
      required: true,
      unique: true,
    },
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    batchID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Incident", "Suggestion", "Bug", "Request"],
      required: true,
    },
    requestDate: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      default: "Unassigned",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    overdue: {
      type: Boolean,
      default: false, 
    },
    resolutionComment: {
      type: String,
    },
    resolutionFile: {
      type: String,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
