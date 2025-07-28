const PythagoraAuthService = require("./pythagoraAuthService.js");

class UserService {
  /**
   * Get user profile from Pythagora API using access token
   */
  static async getUserProfile(accessToken) {
    try {
      console.log('UserService: Getting user profile from Pythagora API');
      return await PythagoraAuthService.getUserProfile(accessToken);
    } catch (err) {
      console.error('UserService: Error fetching user profile from Pythagora API:', err);
      throw new Error(`Error fetching user profile from Pythagora API: ${err}`);
    }
  }
}

module.exports = UserService;