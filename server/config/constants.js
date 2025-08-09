// Centralized constants for the backend
const PYTHAGORA_API_URL = process.env.PYTHAGORA_API_URL || 'https://api.pythagora.ai';
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'admin.deployments.pythagora.ai';

module.exports = {
  PYTHAGORA_API_URL,
  DEPLOYMENT_URL
};