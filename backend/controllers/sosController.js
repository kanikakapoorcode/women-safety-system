const Alert = require("../models/Alert");
const { notifyGuardians } = require("../utils/notifyGuardians");

exports.sendSOS = async (req, res) => {
  try {
    const user = req.user;
    const { location } = req.body;

    // Validate location
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ 
        message: "Location with latitude and longitude is required" 
      });
    }

    // Create alert in database
    const alert = await Alert.create({
      userId: user._id,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      message: `SOS Alert from ${user.name}`,
      status: "active",
    });

    // Prepare alert data for notifications
    const alertData = {
      alertId: alert._id,
      location: alert.location,
      message: alert.message,
      createdAt: alert.createdAt,
    };

    // Notify guardians asynchronously (don't wait for it to complete)
    notifyGuardians(user._id, alertData)
      .then(async (result) => {
        console.log(`✅ Notified ${result.notified} guardian(s) about SOS alert`);
        // Update notifiedAt timestamp
        if (result.notified > 0) {
          await Alert.findByIdAndUpdate(alert._id, { notifiedAt: new Date() });
          
          // Emit socket event for real-time updates
          const io = req.app.get('io');
          if (io) {
            const populatedAlert = await Alert.findById(alert._id).populate('userId', 'name email phone');
            
            // Notify user who sent the alert
            io.to(`user-${user._id}`).emit('new-alert', { alert: populatedAlert });
            
            // Notify all admins
            io.to('admin-room').emit('new-alert', { alert: populatedAlert });
            
            // Notify guardians
            for (const guardian of result.guardians) {
              io.to(`guardian-${guardian.id}`).emit('new-alert', { alert: populatedAlert });
            }
          }
        }
      })
      .catch((error) => {
        console.error("❌ Error notifying guardians:", error);
        // Don't fail the request if notification fails
      });

    res.status(201).json({
      message: "SOS alert sent successfully!",
      user: user.name,
      location: alert.location,
      alertId: alert._id,
      status: alert.status,
    });
  } catch (err) {
    console.error("SOS Controller Error:", err);
    res.status(500).json({ 
      error: "SOS sending failed",
      message: err.message 
    });
  }
};
