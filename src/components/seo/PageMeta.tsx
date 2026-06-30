import { Helmet } from 'react-helmet-async'

export type OpenGraphMeta = {
  title: string
  description: string
  image?: string
  type?: string
}

type PageMetaProps = {
  title: string
  openGraph?: OpenGraphMeta
}

const SITE_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : ''

function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export function PageMeta({ title, openGraph }: PageMetaProps) {
  const ogImage = openGraph?.image
    ? absoluteUrl(openGraph.image)
    : undefined

  return (
    <Helmet>
      <title>{title}</title>
      {openGraph ? (
        <>
          <meta property="og:title" content={openGraph.title} />
          <meta property="og:description" content={openGraph.description} />
          {ogImage ? <meta property="og:image" content={ogImage} /> : null}
          <meta property="og:type" content={openGraph.type ?? 'website'} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={openGraph.title} />
          <meta name="twitter:description" content={openGraph.description} />
          {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        </>
      ) : null}
    </Helmet>
  )
}
