const User = require("../models/User");

/**
 * Notify guardians when a user sends an SOS alert
 * This function can be extended to send emails, SMS, push notifications, etc.
 */
exports.notifyGuardians = async (userId, alertData) => {
  try {
    // Find the user who sent the alert
    const user = await User.findById(userId).populate("guardians", "name email phone");
    
    if (!user || !user.guardians || user.guardians.length === 0) {
      console.log(`No guardians found for user ${userId}`);
      return { notified: 0, guardians: [] };
    }

    const guardians = user.guardians;
    const notifications = [];
    const mapLink = `https://www.google.com/maps?q=${alertData.location.lat},${alertData.location.lng}`;

    // Prepare notification message
    const isResolved = alertData.isResolved || false;
    const message = isResolved 
      ? alertData.message // Use provided message for resolved alerts
      : `🚨 EMERGENCY ALERT! ${user.name} has sent an SOS alert!\n\n` +
        `Location: ${alertData.location.lat}, ${alertData.location.lng}\n` +
        `Map Link: ${mapLink}\n` +
        `Time: ${new Date().toLocaleString()}\n\n` +
        `Please check the alerts page immediately!`;

    // Notify each guardian
    for (const guardian of guardians) {
      const notification = {
        guardianId: guardian._id,
        guardianName: guardian.name,
        guardianEmail: guardian.email,
        guardianPhone: guardian.phone,
        message: message,
        alertId: alertData.alertId,
        userId: userId,
        userName: user.name,
        location: alertData.location,
        timestamp: new Date(),
      };

      notifications.push(notification);

      // Log notification
      console.log(`\n🔔 NOTIFICATION TO GUARDIAN:`);
      console.log(`Guardian: ${guardian.name}`);
      console.log(`Email: ${guardian.email || 'N/A'}`);
      console.log(`Phone: ${guardian.phone || 'N/A'}`);
      console.log(`Message: ${message}`);
      console.log(`---\n`);

      // Send email if available
      if (guardian.email) {
        const emailSubject = `🚨 EMERGENCY: SOS Alert from ${user.name}`;
        await exports.sendEmailNotification(guardian.email, emailSubject, message);
      }

      // Send SMS if available
      if (guardian.phone) {
        // Clean phone number (remove special characters)
        const cleanPhone = guardian.phone.replace(/[^0-9+]/g, '');
        await exports.sendSMSNotification(cleanPhone, message).catch(err => 
          console.error(`SMS notification failed for ${guardian.name}: ${err.message}`)
        );
      }

      // Send WhatsApp if available (optional - set ENABLE_WHATSAPP=true in .env)
      if (guardian.phone && process.env.ENABLE_WHATSAPP === 'true') {
        const cleanPhone = guardian.phone.replace(/[^0-9+]/g, '');
        await exports.sendWhatsAppNotification(cleanPhone, message).catch(err => 
          console.error(`WhatsApp notification failed for ${guardian.name}: ${err.message}`)
        );
      }
    }

    // In production, you would:
    // - Send emails via nodemailer
    // - Send SMS via Twilio
    // - Send push notifications via FCM
    // - Store notification logs in database
    // - Use a queue system (Bull, RabbitMQ) for async notifications

    return {
      notified: guardians.length,
      guardians: guardians.map(g => ({
        id: g._id,
        name: g.name,
        email: g.email,
        phone: g.phone,
      })),
      notifications: notifications,
    };
  } catch (error) {
    console.error("Error notifying guardians:", error);
    throw error;
  }
};

/**
 * Helper function to send email notifications via Nodemailer
 * Configure EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS in .env
 */
exports.sendEmailNotification = async (email, subject, message) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`\n📧 EMAIL NOTIFICATION (Email not configured - check .env):`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message:\n${message}\n`);
      return { sent: false, method: "console", reason: "Email not configured" };
    }

    // Send actual email via Nodemailer
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create HTML version of message
    const htmlMessage = message
      .replace(/\n/g, '<br>')
      .replace(/🚨/g, '<span style="color: red; font-size: 1.2em;">🚨</span>')
      .replace(/📍/g, '<span style="color: blue;">📍</span>');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🛡️ Women Safety Alert</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            ${htmlMessage}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This is an automated emergency alert. Please respond immediately.</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to: ${email} (Message ID: ${result.messageId})`);
    return { sent: true, method: "email", messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Email sending failed to ${email}: ${error.message}`);
    return { sent: false, error: error.message };
  }
};

/**
 * Helper function to send SMS notifications via Twilio
 * Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE in .env
 */
exports.sendSMSNotification = async (phone, message) => {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
      console.log(`\n📱 SMS NOTIFICATION (Twilio not configured - check .env):`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}\n`);
      return { sent: false, method: "console", reason: "Twilio not configured" };
    }

    // Send actual SMS via Twilio
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Ensure phone number is in E.164 format (e.g., +1234567890)
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      // If phone doesn't start with +, assume it needs country code
      // You may need to adjust this based on your country code
      formattedPhone = `+${phone.replace(/^\+/, '')}`;
    }

    const result = await client.messages.create({
      body: message,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE
    });
    
    console.log(`✅ SMS sent to: ${formattedPhone} (SID: ${result.sid})`);
    return { sent: true, method: "sms", sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS sending failed to ${phone}: ${error.message}`);
    return { sent: false, error: error.message };
  }
};

/**
 * Send WhatsApp notification (via Twilio API)
 * Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in .env
 */
exports.sendWhatsAppNotification = async (phone, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log(`\n💬 WhatsApp NOTIFICATION (Twilio WhatsApp not configured - check .env):`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}\n`);
      return { sent: false, method: "console", reason: "Twilio WhatsApp not configured" };
    }

    // Send via Twilio WhatsApp API
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Ensure phone number is in E.164 format
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+${phone.replace(/^\+/, '')}`;
    }

    const result = await client.messages.create({
      body: message,
      to: `whatsapp:${formattedPhone}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    });
    
    console.log(`✅ WhatsApp sent to: ${formattedPhone} (SID: ${result.sid})`);
    return { sent: true, method: "whatsapp", sid: result.sid };
  } catch (error) {
    console.error(`❌ WhatsApp sending failed to ${phone}: ${error.message}`);
    return { sent: false, error: error.message };
  }
};

