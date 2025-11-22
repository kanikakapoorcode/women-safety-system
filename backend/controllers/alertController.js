const Alert = require("../models/Alert");
const User = require("../models/User");

exports.createAlert = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const alert = await Alert.create({
      userId: req.user._id,
      location: { lat, lng },
    });

    res.json({
      message: "SOS Alert created",
      alert,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({
      createdAt: -1,
    }).populate("userId", "name email phone");

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get alerts for guardians (alerts from users they're guardians for)
exports.getGuardianAlerts = async (req, res) => {
  try {
    const guardian = req.user;
    
    // Find all users where this user is a guardian
    const users = await User.find({ guardians: guardian._id });
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      return res.json([]);
    }

    const alerts = await Alert.find({ 
      userId: { $in: userIds },
      status: "active"
    })
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all alerts for admins
exports.getAllAlerts = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const alerts = await Alert.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Resolve an alert
exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const user = req.user;

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Check if user is guardian, admin, or alert owner
    const userObj = await User.findById(alert.userId);
    const isGuardian = userObj.guardians.some(
      g => g.toString() === user._id.toString()
    );
    const isOwner = alert.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isGuardian && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    alert.status = "resolved";
    alert.resolvedAt = new Date();
    alert.resolvedBy = user._id;
    await alert.save();

    // Notify guardians that alert is resolved
    const { notifyGuardians } = require("../utils/notifyGuardians");
    const resolvedMessage = `✅ SAFE NOW! The emergency alert from ${userObj.name} has been resolved.\n\n` +
                           `Resolved by: ${user.name}\n` +
                           `Time: ${new Date().toLocaleString()}\n\n` +
                           `Thank you for your quick response!`;
    
    // Send "Safe Now" notifications to guardians
    notifyGuardians(alert.userId, {
      alertId: alert._id,
      location: alert.location,
      message: resolvedMessage,
      isResolved: true,
    }).catch(err => console.error("Error sending resolved notification:", err));

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    const updatedAlert = await Alert.findById(alertId)
      .populate("resolvedBy", "name email")
      .populate("userId", "name email phone");
    
    if (io) {
      // Notify user who sent the alert
      io.to(`user-${alert.userId}`).emit('alert-resolved', { alert: updatedAlert });
      
      // Notify all admins
      io.to('admin-room').emit('alert-resolved', { alert: updatedAlert });
      
      // Notify guardians
      if (userObj.guardians && userObj.guardians.length > 0) {
        userObj.guardians.forEach(guardian => {
          io.to(`guardian-${guardian._id}`).emit('alert-resolved', { alert: updatedAlert });
        });
      }
    }

    res.json({
      message: "Alert resolved successfully",
      alert: updatedAlert,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, alertId } = req.body;

    let alert;
    
    // If alertId provided, update that specific alert
    if (alertId) {
      alert = await Alert.findById(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      // Verify it belongs to the user
      if (alert.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      // Otherwise, find most recent active alert for user
      alert = await Alert.findOne({ 
        userId: req.user._id,
        status: "active"
      }).sort({
        createdAt: -1,
      });

      if (!alert) {
        return res.status(404).json({ message: "No active alert to update" });
      }
    }

    // Update location
    alert.location = { lat, lng };
    await alert.save();

    res.json({
      message: "Location updated successfully",
      alert: {
        _id: alert._id,
        location: alert.location,
        status: alert.status,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
