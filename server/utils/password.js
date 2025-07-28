const bcrypt = require("bcrypt");

// DEPRECATED: Password handling is now managed externally by Pythagora API
// This file is kept for backward compatibility but should not be used

/**
 * Hashes the password using bcrypt algorithm
 * @param {string} password - The password to hash
 * @return {string} Password hash
 */
const generatePasswordHash = async (password) => {
  console.warn("DEPRECATED: generatePasswordHash should not be used. Password handling is managed by Pythagora API.");
  return null;
};

/**
 * Validates the password against the hash
 * @param {string} password - The password to verify
 * @param {string} hash - Password hash to verify against
 * @return {boolean} True if the password matches the hash, false otherwise
 */
const validatePassword = async (password, hashedPassword) => {
  console.warn("DEPRECATED: validatePassword should not be used. Password handling is managed by Pythagora API.");
  return false;
};

/**
 * Checks that the hash has a valid format
 * @param {string} hash - Hash to check format for
 * @return {boolean} True if passed string seems like valid hash, false otherwise
 */
const isPasswordHash = (hash) => {
  if (!hash || hash.length !== 60) return false;
  try {
    bcrypt.getRounds(hash);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  generatePasswordHash,
  validatePassword,
  isPasswordHash,
};