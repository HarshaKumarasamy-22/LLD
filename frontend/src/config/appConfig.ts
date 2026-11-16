/**
 * Application Branding & Configuration
 * 
 * Note: You can change the title, logo, and app branding here anytime
 * before starting deployment.
 */
export const APP_CONFIG = {
  // Brand name (placeholder - easily updated during deployment)
  name: "Tea Estate 360",
  shortName: "TE360",
  tagline: "Smart Tea Estate Management & Monitoring System",
  
  // Branding Assets (replace these files in /public or /assets at deployment)
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.ico",
  
  // System metadata
  version: "1.0.0",
  defaultTimeZone: "Asia/Colombo", // Configurable per estate
  units: {
    weight: "kg",
    area: "ha",
    ph: "pH",
  },
};
