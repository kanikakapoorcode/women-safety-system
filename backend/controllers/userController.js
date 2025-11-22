const User = require("../models/User");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("guardians", "name email phone");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all guardians for the current user
exports.getMyGuardians = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("guardians", "name email phone role")
      .select("guardians");
    
    res.json(user.guardians || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for users to add as guardians (by email or phone)
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ 
        message: "Search query must be at least 3 characters" 
      });
    }

    // Search by email or phone (excluding current user)
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    }).select("name email phone role");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a guardian to current user's guardians list
exports.addGuardian = async (req, res) => {
  try {
    const { guardianId } = req.body;

    if (!guardianId) {
      return res.status(400).json({ message: "Guardian ID is required" });
    }

    const user = await User.findById(req.user._id);
    const guardian = await User.findById(guardianId);

    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found" });
    }

    // Check if guardian is already added
    if (user.guardians.includes(guardianId)) {
      return res.status(400).json({ message: "Guardian already added" });
    }

    // Prevent adding yourself as guardian
    if (user._id.toString() === guardianId) {
      return res.status(400).json({ message: "Cannot add yourself as guardian" });
    }

    // Add guardian to user's guardians array
    user.guardians.push(guardianId);
    await user.save();

    // Populate and return updated guardians list
    await user.populate("guardians", "name email phone role");

    res.status(200).json({
      message: "Guardian added successfully",
      guardians: user.guardians,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a guardian from current user's guardians list
exports.removeGuardian = async (req, res) => {
  try {
    const { guardianId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if guardian exists in the list
    if (!user.guardians.includes(guardianId)) {
      return res.status(404).json({ message: "Guardian not found in your list" });
    }

    // Remove guardian from array
    user.guardians = user.guardians.filter(
      (id) => id.toString() !== guardianId
    );
    await user.save();

    // Populate and return updated guardians list
    await user.populate("guardians", "name email phone role");

    res.status(200).json({
      message: "Guardian removed successfully",
      guardians: user.guardians,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

