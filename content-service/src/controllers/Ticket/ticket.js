const Ticket = require("../../model/Ticket/ticket");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.createTicket = async (req, res) => {
  try {
    const {
      studentID,
      batchID,
      subject,
      priority,
      type,
      assignedTo,
      requestDate,
    } = req.body;

    if (!studentID || !batchID || !subject || !priority || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });

    let newTicketID;
    if (lastTicket) {
      const lastTicketNumber = parseInt(
        lastTicket.ticketID.replace("TC", ""),
        10
      );
      newTicketID = `TC${lastTicketNumber + 1}`;
    } else {
      newTicketID = "TC101";
    }

    const newTicket = new Ticket({
      ticketID: newTicketID,
      studentID,
      batchID,
      subject,
      priority,
      type,
      assignedTo,
      requestDate,
    });

    const savedTicket = await newTicket.save();
    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: savedTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
exports.resolveTicket = async (req, res) => {
  try {
    const Id = req.params.id;
    const { resolutionComment, resolutionFile } = req.body;

    const existingTicket = await Ticket.findById(Id);
    if (!existingTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (resolutionFile && existingTicket.resolutionFile !== resolutionFile) {
      const oldKey = existingTicket.resolutionFile?.split(".com/")[1];
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldKey,
      };

      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Failed to delete old Image from S3:", s3Error.message);
      }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      Id,
      { resolutionFile, resolutionComment },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(200).json({
      message: "Ticket resolved successfully",
      updatedTicket: updatedTicket,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update Ticket", details: error.message });
  }
};
exports.updateTicketStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedTicket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
exports.getOverdueTickets = async (req, res) => {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find tickets that were created more than 48 hours ago and still "Open" or "In Progress"
    const overdueTickets = await Ticket.find({
      status: { $in: ["Open", "In Progress"] },
      requestDate: { $lte: fortyEightHoursAgo }, // Created more than 48 hours ago
      updatedAt: { $lte: fortyEightHoursAgo }, // Not updated in the last 48 hours
    });

    return res.status(200).json({
      success: true,
      count: overdueTickets.length,
      tickets: overdueTickets,
    });
  } catch (error) {
    console.error("Error fetching overdue tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
exports.getResolvedTickets = async (req, res) => {
  try {
    const resolvedTickets = await Ticket.find({
      status: { $in: ["Resolved", "Closed"] },
    });

    return res.status(200).json({
      success: true,
      count: resolvedTickets.length,
      tickets: resolvedTickets,
    });
  } catch (error) {
    console.error("Error fetching resolved tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
exports.getAllticket = async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    return res.status(200).json({
      success: true,
      count: tickets.length,
      message: "All featching Data",
      data: tickets,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


exports.getStudentTickets = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const studentTickets = await Ticket.find({ studentID: studentId });

    if (studentTickets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No tickets found for this student" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tickets found for student",
      data: studentTickets,
    });

  } catch (error) {
    console.error("Error fetching student tickets:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      details: error.message 
    });
  }
};

