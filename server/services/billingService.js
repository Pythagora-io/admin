const BillingInfo = require("../models/BillingInfo");

/**
 * Service for managing billing information
 */
class BillingService {
  /**
   * Get billing information for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} Billing information object
   */
  static async getBillingInfo(userId) {
    try {
      console.log("Fetching billing info for user:", userId);
      let billingInfo = await BillingInfo.findOne({ userId }).lean();
      console.log("Raw billing info from database:", billingInfo);

      // If no billing info exists, return a default object without saving to the database
      if (!billingInfo) {
        console.log("No billing info found, returning default object");
        // Instead of trying to save an invalid object to the database,
        // just return a default object for the frontend
        return {
          userId,
          name: "Default Name", // Use placeholder values that pass validation
          address: "Default Address",
          city: "Default City",
          state: "Default State",
          zip: "Default Zip",
          country: "Default Country",
        };
      }

      return billingInfo;
    } catch (err) {
      console.error(`Error fetching billing information: ${err.message}`);
      throw new Error(`Error fetching billing information: ${err.message}`);
    }
  }

  /**
   * Update billing information for a user
   * @param {string} userId - The ID of the user
   * @param {Object} billingData - The billing data to update
   * @returns {Promise<Object>} Updated billing information object
   */
  static async updateBillingInfo(userId, billingData) {
    try {
      const allowedFields = [
        "name",
        "address",
        "city",
        "state",
        "zip",
        "country",
      ];
      const updateData = {};

      // Only include allowed fields in the update
      for (const field of allowedFields) {
        if (billingData[field] !== undefined) {
          updateData[field] = billingData[field];
        }
      }

      const options = {
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        setDefaultsOnInsert: true, // Apply schema defaults if creating
      };

      return await BillingInfo.findOneAndUpdate(
        { userId },
        updateData,
        options,
      );
    } catch (err) {
      throw new Error(`Error updating billing information: ${err.message}`);
    }
  }

  /**
   * Get company billing information
   * This would typically come from a database, but for simplicity,
   * we'll return hardcoded values
   *
   * @returns {Promise<Object>} Company billing information
   */
  static async getCompanyBillingInfo() {
    return {
      name: "Pythagora AI Inc.",
      address: "548 Market St.",
      city: "San Francisco",
      state: "CA",
      zip: "94104",
      country: "US",
      taxId: "US123456789",
    };
  }
}

module.exports = BillingService;
