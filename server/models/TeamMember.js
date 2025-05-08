const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "developer", "viewer"],
    default: "viewer",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only have one role per team
teamMemberSchema.index({ userId: 1, teamId: 1 }, { unique: true });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
