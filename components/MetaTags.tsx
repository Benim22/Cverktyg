import Head from 'next/head'

interface MetaTagsProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
}

export function MetaTags({
  title,
  description,
  keywords = "cv, cv-mall, jobbansökan, cv-bygge, online cv, cv-skapare, professionellt cv",
  ogImage = "/images/og-image.jpg",
  ogUrl,
}: MetaTagsProps) {
  // Lägg till grundläggande företagsnamn i titeln om det inte redan finns
  const fullTitle = title.includes("CVerktyg") ? title : `${title} | CVerktyg`
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {ogUrl && <link rel="canonical" href={ogUrl} />}
    </Head>
  )
} 