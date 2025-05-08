const Project = require('../models/Project');
const mongoose = require('mongoose');
const ProjectAccess = require('../models/ProjectAccess');

class ProjectService {
  /**
   * Create a new project draft
   * @param {string} userId - The user ID
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} - Created project
   */
  static async createProject(userId, projectData) {
    try {
      // Create a new project with the user ID and project data
      const project = new Project({
        userId,
        ...projectData,
        status: 'draft', // Ensure it's created as a draft
        createdAt: new Date(),
        lastEdited: new Date()
      });

      // Save the project to the database
      await project.save();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get user projects by type (drafts or deployed)
   * @param {string} userId - The user ID
   * @param {string} type - Project type ('drafts' or 'deployed')
   * @returns {Promise<Array>} - List of projects
   */
  static async getUserProjects(userId, type) {
    try {
      const status = type === 'drafts' ? 'draft' : 'deployed';

      return await Project.find({
        userId,
        status
      }).sort({ lastEdited: -1 });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<Object>} - Project
   */
  static async getProject(projectId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID');
      }

      const project = await Project.findById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      // Check if the user is authorized to access this project
      if (project.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized access to project');
      }

      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Delete projects
   * @param {string} userId - The user ID
   * @param {Array<string>} projectIds - Array of project IDs to delete
   * @returns {Promise<Object>} - Result of deletion
   */
  static async deleteProjects(userId, projectIds) {
    try {
      // Validate project IDs
      const validProjectIds = projectIds.filter(id => mongoose.Types.ObjectId.isValid(id));

      if (validProjectIds.length === 0) {
        throw new Error('No valid project IDs provided');
      }

      // Delete projects that belong to the user
      const result = await Project.deleteMany({
        _id: { $in: validProjectIds },
        userId
      });

      if (result.deletedCount === 0) {
        throw new Error('No projects were deleted. Check if the projects exist and belong to you.');
      }

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error deleting projects:', error);
      throw error;
    }
  }

  /**
   * Update project details
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated project
   */
  static async updateProject(projectId, userId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID');
      }

      // Find the project first to check authorization
      const project = await Project.findById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      // Check if the user is authorized to update this project
      if (project.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this project');
      }

      // Update the project with the new data
      // Set lastEdited to current time
      updateData.lastEdited = new Date();

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $set: updateData },
        { new: true } // Return the updated document
      );

      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Deploy a project draft
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<Object>} - Deployed project
   */
  static async deployProject(projectId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID');
      }

      // Find the project first to check authorization and status
      const project = await Project.findById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      // Check if the user is authorized to deploy this project
      if (project.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to deploy this project');
      }

      // Check if the project is already deployed
      if (project.status === 'deployed') {
        throw new Error('Project is already deployed');
      }

      // Update the project status to deployed and set the deployedAt timestamp
      const now = new Date();
      const deployedProject = await Project.findByIdAndUpdate(
        projectId,
        { 
          $set: { 
            status: 'deployed', 
            deployedAt: now,
            lastEdited: now
          } 
        },
        { new: true } // Return the updated document
      );

      return deployedProject;
    } catch (error) {
      console.error('Error deploying project:', error);
      throw error;
    }
  }

  /**
   * Get users with access to a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} - List of users with access
   */
  static async getProjectAccess(projectId) {
    try {
      // Get all project access records for this project
      const accessRecords = await ProjectAccess.find({ projectId })
        .populate({
          path: 'userId',
          select: 'name email',
          model: 'User'
        })
        .lean();

      // Format the response
      return accessRecords.map(record => ({
        _id: record.userId._id,
        name: record.userId.name,
        email: record.userId.email,
        access: record.access
      }));
    } catch (error) {
      console.error('Error getting project access:', error);
      throw error;
    }
  }

  /**
   * Update users access to a project
   * @param {string} projectId - The project ID
   * @param {Array} users - Array of users with access levels
   * @returns {Promise<boolean>} - Success status
   */
  static async updateProjectAccess(projectId, users) {
    try {
      // Delete all existing access records for this project
      await ProjectAccess.deleteMany({ projectId });

      // Create new access records
      if (users.length > 0) {
        const accessRecords = users.map(user => ({
          userId: user.id,
          projectId,
          access: user.access
        }));

        await ProjectAccess.insertMany(accessRecords);
      }

      return true;
    } catch (error) {
      console.error('Error updating project access:', error);
      throw error;
    }
  }
}

module.exports = ProjectService;