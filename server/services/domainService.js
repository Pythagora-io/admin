const Domain = require("../models/Domain");

class DomainService {
  /**
   * Get all domains for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} - A promise that resolves to an array of domains
   */
  static async getUserDomains(userId) {
    try {
      return await Domain.find({ userId }).sort({ createdAt: -1 });
    } catch (err) {
      throw new Error(`Error fetching user domains: ${err.message}`);
    }
  }

  /**
   * Add a new domain for a user
   * @param {string} userId - The ID of the user
   * @param {string} domain - The domain name
   * @returns {Promise<Object>} - A promise that resolves to the created domain
   */
  static async addDomain(userId, domain) {
    try {
      // Normalize domain (remove protocol, www, trailing slashes)
      const normalizedDomain = domain
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .replace(/\/.*$/, "");

      // Check if domain already exists for this user
      const existingDomain = await Domain.findOne({
        userId,
        domain: normalizedDomain,
      });
      if (existingDomain) {
        throw new Error("This domain has already been added to your account");
      }

      // Create new domain
      const newDomain = new Domain({
        userId,
        domain: normalizedDomain,
        verified: false,
      });

      await newDomain.save();
      return newDomain;
    } catch (err) {
      throw new Error(`Error adding domain: ${err.message}`);
    }
  }

  /**
   * Delete a domain
   * @param {string} userId - The ID of the user
   * @param {string} domainId - The ID of the domain to delete
   * @returns {Promise<boolean>} - A promise that resolves to true if deletion was successful
   */
  static async deleteDomain(userId, domainId) {
    try {
      const result = await Domain.deleteOne({ _id: domainId, userId });
      if (result.deletedCount === 0) {
        throw new Error(
          "Domain not found or you do not have permission to delete it",
        );
      }
      return true;
    } catch (err) {
      throw new Error(`Error deleting domain: ${err.message}`);
    }
  }

  /**
   * Verify a domain
   * @param {string} userId - The ID of the user
   * @param {string} domainId - The ID of the domain to verify
   * @returns {Promise<Object>} - A promise that resolves to the updated domain
   */
  static async verifyDomain(userId, domainId) {
    try {
      // Find domain and ensure it belongs to the user
      const domain = await Domain.findOne({ _id: domainId, userId });

      if (!domain) {
        throw new Error(
          "Domain not found or you do not have permission to verify it",
        );
      }

      // Mock verification process - in the future, this will check DNS records
      domain.verified = true;
      await domain.save();

      return domain;
    } catch (err) {
      throw new Error(`Error verifying domain: ${err.message}`);
    }
  }
}

module.exports = DomainService;
