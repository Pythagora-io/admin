const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["draft", "deployed"],
    default: "draft",
  },
  thumbnail: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  },
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "private",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
  deployedAt: {
    type: Date,
    default: null,
  },
  // Additional project data can be stored here
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Update the lastEdited and updatedAt timestamps on save
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.lastEdited = Date.now();
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
