import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <span>硬地骇客 - 2 个月 12000 美金的实践之路</span>,
  project: {
    link: "https://github.com/hardhackerlabs/book",
  },
  docsRepositoryBase: 'https://github.com/hardhackerlabs/book/tree/main/',
  useNextSeoProps() {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()

    return {
      titleTemplate: frontMatter.title + ' – 硬地骇客'
    }
  }
  // ... other theme options
};
