const express = require("express");
const { requireUser } = require("./middleware/auth");
const ProjectService = require("../services/projectService");
const mongoose = require("mongoose");
const Project = require("../models/Project");

const router = express.Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project draft
 * @access  Private
 */
router.post("/", requireUser, async (req, res) => {
  try {
    console.log("Creating new project draft with data:", req.body);
    const { title, description, visibility = "private", thumbnail } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const projectData = {
      title,
      description,
      visibility,
      thumbnail,
    };

    console.log("Creating project for user:", req.user._id);
    const project = await ProjectService.createProject(
      req.user._id,
      projectData,
    );
    console.log("Project created successfully:", project._id);

    res.status(201).json({
      success: true,
      message: "Project draft created successfully",
      project,
    });
  } catch (error) {
    console.error(`Error creating project draft: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get user projects by type (drafts or deployed)
 * @access  Private
 */
router.get("/", requireUser, async (req, res) => {
  try {
    const { type = "drafts" } = req.query;

    if (!["drafts", "deployed"].includes(type)) {
      return res
        .status(400)
        .json({
          error: 'Invalid project type. Must be either "drafts" or "deployed"',
        });
    }

    const projects = await ProjectService.getUserProjects(req.user._id, type);

    res.status(200).json({ projects });
  } catch (error) {
    console.error(`Error fetching projects: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
router.get("/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectService.getProject(id, req.user._id);

    res.status(200).json({ project });
  } catch (error) {
    console.error(`Error fetching project: ${error}`);

    if (
      error.message === "Project not found" ||
      error.message === "Invalid project ID"
    ) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Unauthorized access to project") {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/projects
 * @desc    Delete projects
 * @access  Private
 */
router.delete("/", requireUser, async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: "Project IDs array is required" });
    }

    const result = await ProjectService.deleteProjects(
      req.user._id,
      projectIds,
    );

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} project(s)`,
    });
  } catch (error) {
    console.error(`Error deleting projects: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put("/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be directly updated
    delete updateData.userId;
    delete updateData._id;
    delete updateData.createdAt;

    const updatedProject = await ProjectService.updateProject(
      id,
      req.user._id,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(`Error updating project: ${error}`);

    if (
      error.message === "Project not found" ||
      error.message === "Invalid project ID"
    ) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Unauthorized to update this project") {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/projects/:id/rename
 * @desc    Rename a project
 * @access  Private
 */
router.put("/:id/rename", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const updatedProject = await ProjectService.updateProject(
      id,
      req.user._id,
      { title },
    );

    res.status(200).json({
      success: true,
      message: "Project renamed successfully",
      project: {
        _id: updatedProject._id,
        title: updatedProject.title,
      },
    });
  } catch (error) {
    console.error(`Error renaming project: ${error}`);

    if (
      error.message === "Project not found" ||
      error.message === "Invalid project ID"
    ) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Unauthorized to update this project") {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/projects/:id/duplicate
 * @desc    Duplicate an existing project
 * @access  Private
 */
router.post("/:id/duplicate", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      `Attempting to duplicate project ${id} for user ${req.user._id}`,
    );

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Get the original project
    const originalProject = await Project.findById(id);

    if (!originalProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user has access to the project
    if (originalProject.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    // Create new project data based on the original
    const duplicateData = {
      title: `${originalProject.title} (Copy)`,
      description: originalProject.description,
      visibility: originalProject.visibility,
      thumbnail: originalProject.thumbnail,
      status: "draft", // Always create as draft
      config: originalProject.config, // Copy the project configuration
    };

    console.log("Creating duplicate project with data:", duplicateData);

    // Create the duplicate project
    const duplicateProject = await ProjectService.createProject(
      req.user._id,
      duplicateData,
    );

    console.log("Project duplicated successfully:", duplicateProject._id);

    res.status(201).json({
      success: true,
      message: "Project duplicated successfully",
      project: duplicateProject,
    });
  } catch (error) {
    console.error(`Error duplicating project: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/projects/:id/deploy
 * @desc    Deploy a project draft
 * @access  Private
 */
router.post("/:id/deploy", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Attempting to deploy project ${id} for user ${req.user._id}`);

    const deployedProject = await ProjectService.deployProject(
      id,
      req.user._id,
    );

    console.log("Project deployed successfully:", deployedProject._id);

    res.status(200).json({
      success: true,
      message: "Project deployed successfully",
      project: deployedProject,
    });
  } catch (error) {
    console.error(`Error deploying project: ${error}`);

    if (
      error.message === "Project not found" ||
      error.message === "Invalid project ID"
    ) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Unauthorized to deploy this project") {
      return res.status(403).json({ error: error.message });
    }

    if (error.message === "Project is already deployed") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id/access
 * @desc    Get users with access to a project
 * @access  Private
 */
router.get("/:id/access", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Check if the project exists and the user has access to it
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the user is the owner of the project
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    // Get all users with access to this project
    const projectAccess = await ProjectService.getProjectAccess(id);

    res.status(200).json({ users: projectAccess });
  } catch (error) {
    console.error(`Error getting project access: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/projects/:id/access
 * @desc    Update users access to a project
 * @access  Private
 */
router.put("/:id/access", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { users } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ error: "Users array is required" });
    }

    // Check if the project exists and the user has access to it
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the user is the owner of the project
    if (project.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update project access" });
    }

    // Update project access
    await ProjectService.updateProjectAccess(id, users);

    res.status(200).json({
      success: true,
      message: "Project access updated successfully",
    });
  } catch (error) {
    console.error(`Error updating project access: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
