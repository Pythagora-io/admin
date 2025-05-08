const mongoose = require("mongoose");

const projectAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  access: {
    type: String,
    enum: ["view", "edit"],
    default: "view",
    required: true,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only have one access level per project
projectAccessSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const ProjectAccess = mongoose.model("ProjectAccess", projectAccessSchema);

module.exports = ProjectAccess;
