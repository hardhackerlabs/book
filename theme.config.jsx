import { useConfig } from "nextra-theme-docs";
import { useRouter } from 'next/router'
import Image from 'next/image'



export default {
  logo: <span>硬地骇客 - 两个月 $12000 ARR 实践之路</span>,
  project: {
    link: "https://github.com/hardhackerlabs/book",
  },
  chat: {
    link: "https://book.hardhacker.com/authors",
    icon: (
      <svg width="24" height="24" viewBox="0 0 60 60">
        <g>
          <path fill="currentColor" d="M26,9.586C11.664,9.586,0,20.09,0,33c0,4.499,1.418,8.856,4.106,12.627c-0.51,5.578-1.86,9.712-3.813,11.666
            c-0.304,0.304-0.38,0.768-0.188,1.153C0.276,58.789,0.625,59,1,59c0.046,0,0.093-0.003,0.14-0.01
            c0.349-0.049,8.432-1.213,14.317-4.585c3.33,1.333,6.874,2.009,10.544,2.009c14.336,0,26-10.503,26-23.414S40.337,9.586,26,9.586z"
            />
          <path fill="currentColor" d="M55.894,37.042C58.582,33.27,60,28.912,60,24.414C60,11.503,48.337,1,34,1c-8.246,0-15.968,3.592-20.824,9.42
            C17.021,8.614,21.38,7.586,26,7.586c15.439,0,28,11.4,28,25.414c0,5.506-1.945,10.604-5.236,14.77
            c4.946,1.887,9.853,2.6,10.096,2.634c0.047,0.006,0.094,0.01,0.14,0.01c0.375,0,0.724-0.211,0.895-0.554
            c0.192-0.385,0.116-0.849-0.188-1.153C57.753,46.753,56.403,42.619,55.894,37.042z"/>
        </g>
      </svg>
    )
  },
  docsRepositoryBase: "https://github.com/hardhackerlabs/book/tree/main/",
  banner: {
    key: 'debut',
    text: (
      <a href="/authors" target="_blank">
        🥳 加入「硬地骇客」知识星球，与作者和读者一起交流探讨！点击了解更多 →
      </a>
    )
  },
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter()
    const { frontMatter } = useConfig()
    const url =
      'https://book.hardhacker.com' +
      (defaultLocale === locale ? asPath : `/${locale}${asPath}`)

    return (
      <>
        <meta property="og:url" content={url} />
        <meta property="og:title" content={frontMatter.title + " – 硬地骇客" || '硬地骇客'} />
        <meta
          property="og:description"
          content={frontMatter.description || '两个月 $12000 ARR 实践之路'}
        />
        <meta property="og:image" content="https://github.com/hardhackerlabs/book/blob/main/public/attachments/other/ARR.png?raw=true" />
      </>
    )
  },

  useNextSeoProps() {
    const { frontMatter } = useConfig();

    return {
      titleTemplate: frontMatter.title + " – 硬地骇客",
    };
  },
  toc: {
    title: "目录",
    extraContent: <>
    <span>🥳 欢迎加入「硬地骇客」社群！</span>
    <Image
      src="/attachments/other/planet.png"
      width={500}
      height={500}
      alt="knowledge planet"
    />
    <span>与作者和广大读者一起交流。 💬</span>
  </>,
  },
  editLink: {
    text: ""
  },
  // ... other theme options
  footer: {
    text: (
      <span>
        Made with 💖 by ©{" "}
        <a href="https://hardhacker.com" target="_blank">
          硬地骇客
        </a>
      </span>
    ),
  },
  faviconGlyph: "🏂",
};
