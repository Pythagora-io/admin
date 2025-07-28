export const PLAN_LINKS = {
  Pro: 'https://buy.stripe.com/8wMdTuboX2AWdoscN2?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
  Premium: 'https://buy.stripe.com/3cseXy2Sr7VgckodR5?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
};

export const PAYMENT_LINKS = {
  $50: 'https://buy.stripe.com/dR69De9gP3F00BG9AH?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
  $100: 'https://buy.stripe.com/eVa2aM64D1wS2JO28g?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
  $200: 'https://buy.stripe.com/7sIg1C78H5N84RW6ox?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
  $500: 'https://buy.stripe.com/7sI16I0Kja3o848fZ8?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
  $1000: 'https://buy.stripe.com/bIY02E0Kj2AW8484gr?prefilled_email=RECIPIENT_EMAIL&client_reference_id=CUSTOMER_ID',
};

export const PLAN_FEATURES = {
  Pro: [
    "Build full-stack applications",
    "Front-end + Back-end",
    "Set up and connect databases",
    "Deploy without watermark",
    "10M tokens included",
  ],
  Premium: [
    "Everything in Pro",
    "20M tokens included",
    "Priority support",
    "Advanced integrations",
    "Advanced analytics",
  ],
};

export const PLAN_PRICES = {
  Pro: 49,
  Premium: 89,
};

// Updated token calculation based on $3 per million tokens
export const TOPUP_TOKENS = {
  $50: 16700000,   // 16.7M tokens ($50 / $3 per million = 16.67M)
  $100: 33300000,  // 33.3M tokens ($100 / $3 per million = 33.33M)
  $200: 66700000,  // 66.7M tokens ($200 / $3 per million = 66.67M)
  $500: 166700000, // 166.7M tokens ($500 / $3 per million = 166.67M)
  $1000: 333300000, // 333.3M tokens ($1000 / $3 per million = 333.33M)
};