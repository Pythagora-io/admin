// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const billingRoutes = require("./routes/billingRoutes");
const domainRoutes = require("./routes/domainRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes = require("./routes/teamRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const { connectDB } = require("./config/database");
const cors = require("cors");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable("json spaces");
// We want to be consistent with URL paths, so we enable strict routing
app.enable("strict routing");

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use("/api/auth", authRoutes);
// User Routes
app.use("/api/user", userRoutes);
// Subscription Routes
app.use("/api/subscription", subscriptionRoutes);
// Stripe Routes
app.use("/api/stripe", stripeRoutes);
// Payment Routes
app.use("/api/payments", paymentRoutes);
// Billing Routes
app.use("/api/billing", billingRoutes);
// Domain Routes
app.use("/api/domains", domainRoutes);
// Project Routes
app.use("/api/projects", projectRoutes);
// Team Routes
app.use("/api/team", teamRoutes);
// Settings Routes
app.use("/api/settings", settingsRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
