import { Helmet } from 'react-helmet-async';

interface Props {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function Head({ 
  title = 'Rate Monitor Pro - Mortgage Rate Monitoring System',
  description = 'Monitor mortgage rates in real-time and get instant alerts when rates match your targets. The perfect tool for mortgage professionals.',
  keywords = 'mortgage rates, rate monitoring, mortgage broker software, rate alerts',
  image = 'https://ratemonitorpro.com/og-image.jpg',
  url = window.location.href
}: Props) {
  const siteTitle = title.includes('Rate Monitor Pro') ? title : `${title} | Rate Monitor Pro`;
  
  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}