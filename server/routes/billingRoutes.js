const express = require("express");
const BillingService = require("../services/billingService");
const { requireUser } = require("./middleware/auth");

const router = express.Router();

// Get billing information for the current user
router.get("/", requireUser, async (req, res) => {
  try {
    console.log("Getting billing info for user ID:", req.user._id);
    const billingInfo = await BillingService.getBillingInfo(req.user._id);
    console.log("Billing info retrieved:", billingInfo);

    // Format the response with the billing info (which is now always a valid object)
    const formattedBillingInfo = {
      name: billingInfo.name,
      address: billingInfo.address,
      city: billingInfo.city,
      state: billingInfo.state,
      zip: billingInfo.zip,
      country: billingInfo.country,
    };

    return res.status(200).json({ billingInfo: formattedBillingInfo });
  } catch (error) {
    console.error(`Error fetching billing information: ${error}`);
    // In case of any error, return an empty billing info object to prevent frontend errors
    return res.status(200).json({
      billingInfo: {
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
    });
  }
});

// Update billing information for the current user
router.put("/", requireUser, async (req, res) => {
  try {
    const { billingInfo } = req.body;

    if (!billingInfo) {
      return res.status(400).json({ error: "Billing information is required" });
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "address",
      "city",
      "state",
      "zip",
      "country",
    ];
    const missingFields = requiredFields.filter((field) => !billingInfo[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const updatedBillingInfo = await BillingService.updateBillingInfo(
      req.user._id,
      billingInfo,
    );

    return res.status(200).json({
      success: true,
      message: "Billing information updated successfully",
      billingInfo: {
        name: updatedBillingInfo.name,
        address: updatedBillingInfo.address,
        city: updatedBillingInfo.city,
        state: updatedBillingInfo.state,
        zip: updatedBillingInfo.zip,
        country: updatedBillingInfo.country,
      },
    });
  } catch (error) {
    console.error(`Error updating billing information: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Get company billing information
router.get("/company", async (req, res) => {
  try {
    const companyInfo = await BillingService.getCompanyBillingInfo();

    return res.status(200).json({ companyInfo });
  } catch (error) {
    console.error(`Error fetching company billing information: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
