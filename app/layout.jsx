import { GoogleAnalytics } from '@next/third-parties/google'
import Image from 'next/image'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'

const siteDescription = '两个月 $12000 ARR 实践之路'
const openGraphImage =
  'https://github.com/hardhackerlabs/book/blob/main/public/attachments/other/ARR.png?raw=true'

export const metadata = {
  metadataBase: new URL('https://book.hardhacker.com'),
  title: {
    default: '硬地骇客',
    template: '%s – 硬地骇客'
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '硬地骇客',
    title: '硬地骇客',
    description: siteDescription,
    url: '/',
    images: [openGraphImage]
  }
}

const banner = (
  <Banner storageKey="debut">
    <a href="/authors" target="_blank">
      🥳 加入「硬地骇客」知识星球，与作者和读者一起交流探讨！点击了解更多 →
    </a>
  </Banner>
)

const navbar = (
  <Navbar
    logo={<span>硬地骇客 - 两个月 $12000 ARR 实践之路</span>}
    projectLink="https://github.com/hardhackerlabs/book"
    chatLink="https://book.hardhacker.com/authors"
    chatIcon={
      <svg width="24" height="24" viewBox="0 0 60 60" aria-label="加入社群">
        <g>
          <path
            fill="currentColor"
            d="M26,9.586C11.664,9.586,0,20.09,0,33c0,4.499,1.418,8.856,4.106,12.627c-0.51,5.578-1.86,9.712-3.813,11.666 c-0.304,0.304-0.38,0.768-0.188,1.153C0.276,58.789,0.625,59,1,59c0.046,0,0.093-0.003,0.14-0.01 c0.349-0.049,8.432-1.213,14.317-4.585c3.33,1.333,6.874,2.009,10.544,2.009c14.336,0,26-10.503,26-23.414S40.337,9.586,26,9.586z"
          />
          <path
            fill="currentColor"
            d="M55.894,37.042C58.582,33.27,60,28.912,60,24.414C60,11.503,48.337,1,34,1c-8.246,0-15.968,3.592-20.824,9.42 C17.021,8.614,21.38,7.586,26,7.586c15.439,0,28,11.4,28,25.414c0,5.506-1.945,10.604-5.236,14.77 c4.946,1.887,9.853,2.6,10.096,2.634c0.047,0.006,0.094,0.01,0.14,0.01c0.375,0,0.724-0.211,0.895-0.554 c0.192-0.385,0.116-0.849-0.188-1.153C57.753,46.753,56.403,42.619,55.894,37.042z"
          />
        </g>
      </svg>
    }
  />
)

const footer = (
  <Footer>
    <span>
      Made with 💖 by ©{' '}
      <a href="https://hardhacker.com" target="_blank">
        硬地骇客
      </a>
    </span>
  </Footer>
)

const toc = {
  title: '目录',
  extraContent: (
    <>
      <span>🥳 欢迎加入「硬地骇客」社群！</span>
      <Image
        src="/attachments/other/planet.png"
        width={500}
        height={500}
        alt="knowledge planet"
      />
      <span>与作者和广大读者一起交流。 💬</span>
    </>
  )
}

export default async function RootLayout({ children }) {
  return (
    <html lang="zh-CN" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="🏂" />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/hardhackerlabs/book/tree/main"
          editLink={null}
          footer={footer}
          toc={toc}
        >
          {children}
        </Layout>
        <GoogleAnalytics gaId="G-JRLVFLQT49" />
      </body>
    </html>
  )
}
