/**
 * Configuration file for subscription plans
 * Contains all available subscription plans with their details
 */
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    tokens: 0,
    features: ['Use your own API keys', 'Build front-end only apps', '1 deployed app', 'Watermark on deployed apps']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    currency: 'USD',
    tokens: 10000000,
    features: ['Build full-stack applications', 'Front-end + Back-end', 'Set up and connect databases', 'Deploy without watermark', '10M tokens included']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89,
    currency: 'USD',
    tokens: 20000000,
    features: ['Everything in Pro', '20M tokens included', 'Priority support', 'Advanced integrations']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    currency: 'USD',
    tokens: null,
    isEnterprise: true,
    features: ['Everything in Premium', 'Unlimited deployments', 'SSO', 'SLA', 'Access control', 'Audit logging']
  }
];

module.exports = subscriptionPlans;