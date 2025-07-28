const express = require("express");
const router = express.Router();
const OrganizationService = require("../services/organizationService");

// Accept organization invitation
router.post('/organizations/accept-invite', async (req, res) => {
  try {
    console.log('Accept invite endpoint called with token');
    
    const { token } = req.body;
    
    if (!token) {
      console.log('Accept invite: No token provided');
      return res.status(400).json({
        success: false,
        error: 'Invitation token is required'
      });
    }

    // Get user info from access token
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      console.log('Accept invite: No access token provided');
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    console.log('Accept invite: Processing invitation acceptance');
    const result = await OrganizationService.acceptInvitation(token, accessToken);
    
    if (result.success) {
      console.log('Accept invite: Invitation accepted successfully');
      res.json(result);
    } else {
      console.log('Accept invite: Failed to accept invitation:', result.error);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Accept invite endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;