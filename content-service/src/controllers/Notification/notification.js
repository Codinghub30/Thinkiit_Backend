const Notification = require("../../model/Notification/notification");
const generateNotificationEmail = require("../../Services/emailTemplate");
const sendNotificationEmail  = require("../../Services/emailService");

exports.createNotifications = async (req, res) => {
  try {
    const { title, description, createby,recipientEmail  } = req.body;
    if (!title || !description || !createby) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newNotification = new Notification({
      title,
      description,
      createby,
      recipientEmail
    });
    const savedNotification = await newNotification.save();
    const emailContent = generateNotificationEmail(title, description, createby,recipientEmail);

    // Send email notification
    await sendNotificationEmail(recipientEmail, emailContent.subject, emailContent.text, emailContent.html);
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: savedNotification,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getNotification = async(req,res)=>{
    try {
    const notifications = await  Notification.find({}).sort({ createdAt: -1 })
    return res.status(200).json({success:true, message:"Data is fetched successfully", data:notifications})
    } catch (error) {
       console.error(error)
       return res.status(500).json({ message: "Internal Server Error" });
    }
}