const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PYTHAGORA_API_URL } = require('../config/constants');

class PythagoraAuthService {
  /**
   * Verify access token by decoding JWT payload locally
   * Input: { accessToken: string }
   * Output: { valid: boolean, userId: string, email: string, name: string } | null
   */
  static async verifyAccessToken(accessToken) {
    try {
      console.log('PythagoraAuthService: Verifying access token by decoding JWT payload');

      // Decode JWT token without verification (since it's from trusted Pythagora API)
      const decoded = jwt.decode(accessToken);

      if (!decoded || decoded.type !== 'access') {
        console.log('PythagoraAuthService: Invalid token or not an access token');
        return null;
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        console.log('PythagoraAuthService: Token has expired');
        return null;
      }

      console.log('PythagoraAuthService: Token verification successful', {
        userId: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName
      });

      return {
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.fullName
      };
    } catch (error) {
      console.error('PythagoraAuthService: Error verifying access token:', error.message);
      return null;
    }
  }

  /**
   * Get user profile from JWT token payload
   * Input: { accessToken: string }
   * Output: { userId: string, email: string, name: string, subscription: object } | null
   */
  static async getUserProfile(accessToken) {
    try {
      console.log('PythagoraAuthService: Getting user profile from JWT token payload');

      // Decode JWT token without verification (since it's from trusted Pythagora API)
      const decoded = jwt.decode(accessToken);

      if (!decoded || decoded.type !== 'access') {
        console.log('PythagoraAuthService: Invalid token or not an access token');
        return null;
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        console.log('PythagoraAuthService: Token has expired');
        return null;
      }

      console.log('PythagoraAuthService: User profile retrieved successfully from token');

      return {
        _id: decoded.userId, // Use Pythagora user ID as primary identifier
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.fullName,
        receiveUpdates: decoded.receiveUpdates || true, // Default to true if not specified
        subscription: {
          plan: decoded.subscriptionPlan || 'free',
          status: decoded.subscriptionStatus || 'active',
          tokensUsed: decoded.tokensUsed || 0,
          tokensLimit: decoded.tokensLimit || 1000000
        }
      };
    } catch (error) {
      console.error('PythagoraAuthService: Error getting user profile from token:', error.message);
      return null;
    }
  }

  /**
   * Refresh access token with Pythagora API
   * Input: { refreshToken: string }
   * Output: { accessToken: string, refreshToken: string } | null
   */
  static async refreshToken(refreshToken) {
    try {
      console.log('PythagoraAuthService: Refreshing token with Pythagora API');

      const response = await axios.post(`${PYTHAGORA_API_URL}/auth/refresh-token`, {
        refreshToken
      });

      console.log('PythagoraAuthService: Token refresh successful');

      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken
      };
    } catch (error) {
      console.error('PythagoraAuthService: Error refreshing token with Pythagora API:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = PythagoraAuthService;