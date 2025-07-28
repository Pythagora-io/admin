// This file has been removed as part of server minimization
// All authentication is now handled client-side with Pythagora API
module.exports = {
  requireUser: (req, res, next) => {
    res.status(501).json({ 
      message: "Authentication middleware has been removed. All functionality is now handled client-side with Pythagora API." 
    });
  }
};