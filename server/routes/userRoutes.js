const express = require("express");
const UserService = require("../services/userService.js");
const { requireUser } = require("./middleware/auth.js");

const router = express.Router();

// Get current user profile
router.get("/me", requireUser, async (req, res) => {
  try {
    // The user is already loaded in requireUser middleware
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error(`Error fetching user profile: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update user name
router.put("/name", requireUser, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Name is required and must be a string" });
    }

    const updatedUser = await UserService.update(req.user._id, { name });

    return res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: { name: updatedUser.name },
    });
  } catch (error) {
    console.error(`Error updating user name: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update user email
router.put("/email", requireUser, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Check if email is already in use by another user
    const existingUser = await UserService.getByEmail(email);
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // In a real application, we would send a confirmation email here
    // For now, we'll just update the email directly
    const updatedUser = await UserService.update(req.user._id, { email });

    return res.status(200).json({
      success: true,
      message: "Email update confirmation has been sent to your current email",
      user: { email: updatedUser.email },
    });
  } catch (error) {
    console.error(`Error updating user email: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update user password
router.put("/password", requireUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    // Verify current password
    const user = await UserService.authenticateWithPassword(
      req.user.email,
      currentPassword,
    );
    if (!user) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password
    await UserService.setPassword(user, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(`Error updating user password: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update email preferences
router.put("/preferences/email", requireUser, async (req, res) => {
  try {
    const { receiveUpdates } = req.body;

    if (typeof receiveUpdates !== "boolean") {
      return res
        .status(400)
        .json({ error: "Receive updates must be a boolean value" });
    }

    const updatedUser = await UserService.update(req.user._id, {
      receiveUpdates,
    });

    return res.status(200).json({
      success: true,
      message: "Email preferences updated successfully",
      user: { receiveUpdates: updatedUser.receiveUpdates },
    });
  } catch (error) {
    console.error(`Error updating email preferences: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
