export const flags = {
  moderation: process.env.FEATURE_MODERATION !== 'false',
  providerFailover: process.env.FEATURE_FAILOVER !== 'false',
}
