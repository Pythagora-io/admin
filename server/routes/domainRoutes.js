const express = require("express");
const { requireUser } = require("./middleware/auth");
const DomainService = require("../services/domainService");

const router = express.Router();

/**
 * @route   GET /api/domains
 * @desc    Get all domains for the authenticated user
 * @access  Private
 */
router.get("/", requireUser, async (req, res) => {
  try {
    const domains = await DomainService.getUserDomains(req.user._id);
    res.status(200).json({ domains });
  } catch (error) {
    console.error(`Error fetching domains: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/domains
 * @desc    Add a new domain for the authenticated user
 * @access  Private
 */
router.post("/", requireUser, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain name is required" });
    }

    // Basic domain format validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domain.toLowerCase())) {
      return res
        .status(400)
        .json({
          error: "Please enter a valid domain name (e.g., example.com)",
        });
    }

    const newDomain = await DomainService.addDomain(req.user._id, domain);

    res.status(201).json({
      success: true,
      message: "Domain added successfully",
      domain: newDomain,
    });
  } catch (error) {
    console.error(`Error adding domain: ${error}`);

    // Handle duplicate domain error specifically
    if (error.message.includes("already been added")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/domains/:id
 * @desc    Delete a domain
 * @access  Private
 */
router.delete("/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    await DomainService.deleteDomain(req.user._id, id);

    res.status(200).json({
      success: true,
      message: "Domain deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting domain: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/domains/:id/verify
 * @desc    Verify a domain for the authenticated user
 * @access  Private
 */
router.put("/:id/verify", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the domain's verification status
    const domain = await DomainService.verifyDomain(req.user._id, id);

    res.status(200).json({
      success: true,
      message: "Domain verified successfully",
      domain,
    });
  } catch (error) {
    console.error(`Error verifying domain: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
