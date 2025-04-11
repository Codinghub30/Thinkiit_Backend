const generateNotificationEmail = (title, description, createby,) => {
    return {
      subject: `New Notification: ${title}`,
      text: `${description}\n\nCreated by: ${createby}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; text-align: center;">
          <!-- Title -->
          <h2 style="color: #333;">${title}</h2>
          
          <!-- Description -->
          <p style="color: #666; font-size: 16px;">${description}</p>
          
          <!-- Created By -->
          <p style="color: #888; font-size: 14px;"><strong>Created by:</strong> ${createby}</p>
         
        </div>
      `,
    };
  };
  
  module.exports = generateNotificationEmail;
  
  