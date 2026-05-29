export const ALERT_THRESHOLDS = {
  boostSuggestion: {
    minReviews: 10,
    minSupporterPct: 30,
    cooldownDays: 30,
  },
  accuracyCheck: {
    minReviews: 10,
    maxSupporterPct: 10,
  },
} as const;
