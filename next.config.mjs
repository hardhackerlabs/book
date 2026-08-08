import nextra from 'nextra'

const isProd = process.env.NODE_ENV === 'production'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx'
})

export default withNextra({
  assetPrefix: isProd ? 'https://book.hardhacker.com' : undefined
})
