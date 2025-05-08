/**
 * Configuration for user settings with descriptions and default values
 */
const settingsConfig = {
  enableEmailNotifications: {
    title: "Email Notifications",
    description:
      "Receive email notifications about account activity and updates",
    default: true,
  },
  enableUsageAlerts: {
    title: "Usage Alerts",
    description: "Get notified when you approach your usage limits",
    default: true,
  },
  shareAnonymousData: {
    title: "Share Anonymous Data",
    description: "Help us improve by sharing anonymous usage data",
    default: false,
  },
  darkModePreference: {
    title: "Dark Mode",
    description: "Enable dark mode for the dashboard interface",
    default: true,
  },
  enableApiLogging: {
    title: "API Logging",
    description: "Log all API calls for debugging purposes",
    default: true,
  },
  enableDebugMode: {
    title: "Debug Mode",
    description: "Enable additional debugging information",
    default: false,
  },
  autoSaveProjects: {
    title: "Auto-Save Projects",
    description: "Automatically save projects while editing",
    default: true,
  },
};

module.exports = settingsConfig;
