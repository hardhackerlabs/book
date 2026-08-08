import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

const siteDescription = '两个月 $12000 ARR 实践之路'
const openGraphImage =
  'https://github.com/hardhackerlabs/book/blob/main/public/attachments/other/ARR.png?raw=true'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const { mdxPath } = await props.params
  const { metadata } = await importPage(mdxPath)
  const pathname = mdxPath?.length ? `/${mdxPath.join('/')}` : '/'
  const description = metadata.description || siteDescription
  const title = metadata.title || '硬地骇客'

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: pathname
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: '硬地骇客',
      ...metadata.openGraph,
      title: metadata.title ? `${metadata.title} – 硬地骇客` : title,
      description,
      url: pathname,
      images: metadata.openGraph?.images || [openGraphImage]
    }
  }
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props) {
  const params = await props.params
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(
    params.mdxPath
  )

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
