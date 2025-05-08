const TeamMember = require('../models/TeamMember');
const Team = require('../models/Team');
const User = require('../models/User');
const ProjectAccess = require('../models/ProjectAccess');
const Project = require('../models/Project');

class TeamService {
  // Get all team members for a team
  static async getTeamMembers() {
    try {
      // Find all team members and populate with user data
      const teamMembers = await TeamMember.find()
        .populate({
          path: 'userId',
          select: 'name email', // Include name field
          model: User
        })
        .lean();

      // Format the response
      const formattedMembers = teamMembers.map(member => {
        return {
          _id: member._id,
          userId: member.userId?._id,
          name: member.userId?.name || 'Unknown User', // Add name field with fallback
          email: member.userId?.email,
          role: member.role,
          joinedAt: member.joinedAt
        };
      });

      return formattedMembers;
    } catch (err) {
      throw new Error(`Error getting team members: ${err.message}`);
    }
  }

  // Invite a user to join the team
  static async inviteTeamMember(email) {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      // Check if user is already a team member
      const existingMember = await TeamMember.findOne({ userId: user._id });
      if (existingMember) {
        throw new Error(`User with email ${email} is already a team member`);
      }

      // Find the default team or create one if it doesn't exist
      let team = await Team.findOne();
      if (!team) {
        // Create a default team if none exists
        team = new Team({
          name: 'Default Team',
          ownerId: user._id, // Use the first user as owner
        });
        await team.save();
        console.log('Created default team:', team._id);
      }

      // Create a new team member with the teamId
      const teamMember = new TeamMember({
        userId: user._id,
        teamId: team._id, // Add the teamId
        role: 'viewer' // Default role
      });

      await teamMember.save();

      return {
        success: true,
        message: `Invitation sent to ${email}`
      };
    } catch (err) {
      throw new Error(`Error inviting team member: ${err.message}`);
    }
  }

  // Remove a team member
  static async removeTeamMember(memberId) {
    try {
      const result = await TeamMember.deleteOne({ _id: memberId });
      if (result.deletedCount === 0) {
        throw new Error('Team member not found');
      }

      return {
        success: true,
        message: 'Team member removed successfully'
      };
    } catch (err) {
      throw new Error(`Error removing team member: ${err.message}`);
    }
  }

  // Update a team member's role
  static async updateTeamMemberRole(memberId, role) {
    try {
      const teamMember = await TeamMember.findOneAndUpdate(
        { _id: memberId },  // Changed from userId to _id
        { role },
        { new: true }
      );

      if (!teamMember) {
        throw new Error('Team member not found');
      }

      return {
        success: true,
        message: `Team member role updated to ${role}`
      };
    } catch (err) {
      throw new Error(`Error updating team member role: ${err.message}`);
    }
  }

  // Get member's project access
  static async getMemberAccess(memberId) {
    try {
      console.log(`Getting access for member ID: ${memberId}`);
      const projectAccess = await ProjectAccess.find({ userId: memberId })
        .populate({
          path: 'projectId',
          select: 'title', // Changed from 'name -_id' to 'title'
          model: Project
        })
        .lean();
      
      console.log(`Found ${projectAccess.length} project access records`);
      console.log('Project access data:', JSON.stringify(projectAccess));
      
      return {
        projects: projectAccess.map(access => ({
          _id: access.projectId._id,
          name: access.projectId.title, // Map 'title' to 'name' for frontend consistency
          access: access.access
        }))
      };
    } catch (err) {
      console.error(`Error getting member access: ${err.message}`);
      throw new Error(`Error getting member access: ${err.message}`);
    }
  }

  // Update member's project access
  static async updateMemberAccess(memberId, projects) {
    try {
      // Delete existing access
      await ProjectAccess.deleteMany({ userId: memberId });

      // Create new access entries
      const accessEntries = projects.map(project => ({
        userId: memberId,
        projectId: project.id,
        access: project.access
      }));

      if (accessEntries.length > 0) {
        await ProjectAccess.insertMany(accessEntries);
      }

      return {
        success: true,
        message: 'Member access updated successfully'
      };
    } catch (err) {
      throw new Error(`Error updating member access: ${err.message}`);
    }
  }

  // Search for projects
  static async searchProjects(query) {
    try {
      const projects = await Project.find({
        title: { $regex: query, $options: 'i' } // Changed from 'name' to 'title'
      })
      .select('title') // Changed from 'name' to 'title'
      .lean();

      return {
        projects: projects.map(project => ({
          _id: project._id,
          name: project.title // Map 'title' to 'name' for frontend consistency
        }))
      };
    } catch (err) {
      throw new Error(`Error searching projects: ${err.message}`);
    }
  }
}

module.exports = TeamService;