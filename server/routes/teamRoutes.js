const express = require("express");
const router = express.Router();
const TeamService = require("../services/teamService");
const { requireUser } = require("./middleware/auth");

// Get team members
router.get("/", requireUser, async (req, res) => {
  try {
    console.log("GET /api/team endpoint called");
    const members = await TeamService.getTeamMembers();
    console.log("Team members retrieved:", JSON.stringify(members));
    return res.status(200).json({ members });
  } catch (error) {
    console.error(`Error fetching team members: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Invite team member
router.post("/invite", requireUser, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const result = await TeamService.inviteTeamMember(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error inviting team member: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Remove team member
router.delete("/:id", requireUser, async (req, res) => {
  try {
    const memberId = req.params.id;
    const result = await TeamService.removeTeamMember(memberId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error removing team member: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update team member role
router.put("/:id/role", requireUser, async (req, res) => {
  try {
    const memberId = req.params.id;
    const { role } = req.body;

    if (!role || !["admin", "developer", "viewer"].includes(role)) {
      return res.status(400).json({
        error: "Valid role is required (admin, developer, or viewer)",
      });
    }

    const result = await TeamService.updateTeamMemberRole(memberId, role);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error updating team member role: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Get member access
router.get("/:id/access", requireUser, async (req, res) => {
  try {
    const memberId = req.params.id;
    const result = await TeamService.getMemberAccess(memberId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error getting member access: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Update member access
router.put("/:id/access", requireUser, async (req, res) => {
  try {
    const memberId = req.params.id;
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({ error: "Projects must be an array" });
    }

    for (const project of projects) {
      if (
        !project.id ||
        !project.access ||
        !["view", "edit"].includes(project.access)
      ) {
        return res.status(400).json({
          error: "Each project must have an id and access (view or edit)",
        });
      }
    }

    const result = await TeamService.updateMemberAccess(memberId, projects);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error updating member access: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Search projects
router.get("/projects/search", requireUser, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await TeamService.searchProjects(query);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error searching projects: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
