const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const ProjectAccess = require("../models/ProjectAccess");

class TeamService {
  /**
   * Get team members for a user's team
   * @param {string} userId - Pythagora user ID
   * @returns {Promise<Array>} Team members
   */
  static async getTeamMembers(userId) {
    try {
      console.log(`TeamService: Getting team members for userId: ${userId}`);

      // Find team where user is owner
      const team = await Team.findOne({ ownerId: userId });
      
      if (!team) {
        console.log(`TeamService: No team found for userId: ${userId}`);
        return [];
      }

      const teamMembers = await TeamMember.find({ teamId: team._id })
        .sort({ joinedAt: -1 });

      // Mock team member data for development
      const mockMembers = [
        {
          _id: "member_1",
          userId: "pythagora_user_1",
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          _id: "member_2", 
          userId: "pythagora_user_2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "member",
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ];

      return teamMembers.length > 0 ? teamMembers : mockMembers;
    } catch (error) {
      console.error('TeamService: Error getting team members:', error);
      throw new Error(`Failed to get team members: ${error.message}`);
    }
  }

  /**
   * Invite a member to the team
   * @param {string} ownerId - Team owner's Pythagora user ID
   * @param {string} email - Email of user to invite
   * @returns {Promise<Object>} Invitation result
   */
  static async inviteMember(ownerId, email) {
    try {
      console.log(`TeamService: Inviting member ${email} to team owned by ${ownerId}`);

      // Find or create team
      let team = await Team.findOne({ ownerId });
      if (!team) {
        team = new Team({
          name: `${ownerId}'s Team`,
          ownerId
        });
        await team.save();
      }

      // In a real implementation, this would:
      // 1. Send invitation email via Pythagora API
      // 2. Create pending invitation record
      // 3. Handle invitation acceptance flow

      return {
        success: true,
        message: "Team member invited successfully",
        email
      };
    } catch (error) {
      console.error('TeamService: Error inviting team member:', error);
      throw new Error(`Failed to invite team member: ${error.message}`);
    }
  }

  /**
   * Remove a member from the team
   * @param {string} ownerId - Team owner's Pythagora user ID
   * @param {string} memberId - Member ID to remove
   * @returns {Promise<Object>} Removal result
   */
  static async removeMember(ownerId, memberId) {
    try {
      console.log(`TeamService: Removing member ${memberId} from team owned by ${ownerId}`);

      const team = await Team.findOne({ ownerId });
      if (!team) {
        throw new Error("Team not found");
      }

      await TeamMember.findOneAndDelete({ 
        teamId: team._id, 
        _id: memberId 
      });

      return {
        success: true,
        message: "Team member removed successfully"
      };
    } catch (error) {
      console.error('TeamService: Error removing team member:', error);
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }

  /**
   * Update member role
   * @param {string} ownerId - Team owner's Pythagora user ID
   * @param {string} memberId - Member ID to update
   * @param {string} role - New role
   * @returns {Promise<Object>} Update result
   */
  static async updateMemberRole(ownerId, memberId, role) {
    try {
      console.log(`TeamService: Updating role for member ${memberId} to ${role}`);

      const team = await Team.findOne({ ownerId });
      if (!team) {
        throw new Error("Team not found");
      }

      const member = await TeamMember.findOneAndUpdate(
        { teamId: team._id, _id: memberId },
        { role },
        { new: true }
      );

      if (!member) {
        throw new Error("Team member not found");
      }

      return {
        success: true,
        message: "Member role updated successfully",
        member
      };
    } catch (error) {
      console.error('TeamService: Error updating member role:', error);
      throw new Error(`Failed to update member role: ${error.message}`);
    }
  }

  /**
   * Search users for team invitation
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  static async searchUsers(query) {
    try {
      console.log(`TeamService: Searching users with query: ${query}`);

      // In a real implementation, this would search users via Pythagora API
      const mockResults = [
        {
          userId: "pythagora_user_3",
          name: "Alice Johnson",
          email: "alice@example.com"
        },
        {
          userId: "pythagora_user_4", 
          name: "Bob Wilson",
          email: "bob@example.com"
        }
      ].filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

      return mockResults;
    } catch (error) {
      console.error('TeamService: Error searching users:', error);
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  /**
   * Get project access for a team member
   * @param {string} ownerId - Team owner's Pythagora user ID
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Project access list
   */
  static async getMemberProjectAccess(ownerId, memberId) {
    try {
      console.log(`TeamService: Getting project access for member ${memberId}`);

      const team = await Team.findOne({ ownerId });
      if (!team) {
        throw new Error("Team not found");
      }

      const member = await TeamMember.findOne({ 
        teamId: team._id, 
        _id: memberId 
      });
      
      if (!member) {
        throw new Error("Team member not found");
      }

      const projectAccess = await ProjectAccess.find({ 
        userId: member.userId 
      });

      return projectAccess;
    } catch (error) {
      console.error('TeamService: Error getting member project access:', error);
      throw new Error(`Failed to get member project access: ${error.message}`);
    }
  }

  /**
   * Update project access for a team member
   * @param {string} ownerId - Team owner's Pythagora user ID
   * @param {string} memberId - Member ID
   * @param {Array} accessList - Project access list
   * @returns {Promise<Object>} Update result
   */
  static async updateMemberProjectAccess(ownerId, memberId, accessList) {
    try {
      console.log(`TeamService: Updating project access for member ${memberId}`);

      const team = await Team.findOne({ ownerId });
      if (!team) {
        throw new Error("Team not found");
      }

      const member = await TeamMember.findOne({ 
        teamId: team._id, 
        _id: memberId 
      });
      
      if (!member) {
        throw new Error("Team member not found");
      }

      // Remove existing access
      await ProjectAccess.deleteMany({ userId: member.userId });

      // Add new access
      const accessPromises = accessList.map(access => {
        const projectAccess = new ProjectAccess({
          userId: member.userId,
          projectId: access.projectId,
          accessLevel: access.accessLevel
        });
        return projectAccess.save();
      });

      await Promise.all(accessPromises);

      return {
        success: true,
        message: "Project access updated successfully"
      };
    } catch (error) {
      console.error('TeamService: Error updating member project access:', error);
      throw new Error(`Failed to update member project access: ${error.message}`);
    }
  }

  /**
   * Search projects for access management
   * @param {string} query - Search query
   * @returns {Promise<Array>} Project search results
   */
  static async searchProjects(query) {
    try {
      console.log(`TeamService: Searching projects with query: ${query}`);

      // In a real implementation, this would search projects via Pythagora API
      const mockProjects = [
        {
          _id: "project_1",
          title: "E-commerce Website",
          description: "Online store application"
        },
        {
          _id: "project_2",
          title: "Mobile App",
          description: "React Native mobile application"
        }
      ].filter(project => 
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      );

      return mockProjects;
    } catch (error) {
      console.error('TeamService: Error searching projects:', error);
      throw new Error(`Failed to search projects: ${error.message}`);
    }
  }
}

module.exports = TeamService;