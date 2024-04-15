const isProd = process.env.NODE_ENV === 'production'

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

module.exports = withNextra({
  assetPrefix: isProd ? 'https://book.hardhacker.com' : undefined,
});

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
