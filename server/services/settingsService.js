const Settings = require('../models/Settings');
const settingsConfig = require('../config/settingsConfig');

class SettingsService {
  /**
   * Get settings for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User settings or default settings if not found
   */
  static async getUserSettings(userId) {
    try {
      let userSettings = await Settings.findOne({ userId });
      
      // If no settings found, create default settings
      if (!userSettings) {
        const defaultSettings = {};
        
        // Use defaults from config
        Object.keys(settingsConfig).forEach(key => {
          defaultSettings[key] = settingsConfig[key].default;
        });
        
        userSettings = await Settings.create({
          userId,
          settings: defaultSettings
        });
      }
      
      return userSettings.settings;
    } catch (error) {
      console.error(`Error getting user settings: ${error}`);
      throw new Error(`Failed to get user settings: ${error.message}`);
    }
  }

  /**
   * Update settings for a user
   * @param {string} userId - The user ID
   * @param {Object} settings - The settings to update
   * @returns {Promise<Object>} - Updated settings
   */
  static async updateUserSettings(userId, settings) {
    try {
      // Validate settings
      const validSettings = {};
      Object.keys(settings).forEach(key => {
        if (settingsConfig[key] !== undefined && typeof settings[key] === 'boolean') {
          validSettings[key] = settings[key];
        }
      });

      // Update or create settings
      const options = { new: true, upsert: true, setDefaultsOnInsert: true };
      const updatedSettings = await Settings.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            settings: validSettings,
            updatedAt: new Date()
          } 
        },
        options
      );
      
      return updatedSettings.settings;
    } catch (error) {
      console.error(`Error updating user settings: ${error}`);
      throw new Error(`Failed to update user settings: ${error.message}`);
    }
  }

  /**
   * Get settings descriptions from config
   * @returns {Object} - Settings descriptions
   */
  static getSettingDescriptions() {
    const descriptions = {};
    
    Object.keys(settingsConfig).forEach(key => {
      descriptions[key] = {
        title: settingsConfig[key].title,
        description: settingsConfig[key].description
      };
    });
    
    return descriptions;
  }
}

module.exports = SettingsService;