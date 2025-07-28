const jwt = require("jsonwebtoken");

// These functions are deprecated and should not be used
// Authentication is now handled by Pythagora API
const generateAccessToken = (user) => {
  console.warn("DEPRECATED: generateAccessToken should not be used. Authentication is handled by Pythagora API.");
  return null;
};

const generateRefreshToken = (user) => {
  console.warn("DEPRECATED: generateRefreshToken should not be used. Authentication is handled by Pythagora API.");
  return null;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};