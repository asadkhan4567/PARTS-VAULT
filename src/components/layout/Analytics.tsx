import Script from 'next/script'

/** GA4 + Meta Pixel, only when the owner has entered IDs in SEO & Analytics. Loaded after the page is interactive. */
export function Analytics({ ga4Id, pixelId }: { ga4Id?: string | null; pixelId?: string | null }) {
  const ga = ga4Id && /^G-[A-Z0-9]+$/i.test(ga4Id) ? ga4Id : null
  const px = pixelId && /^\d+$/.test(pixelId) ? pixelId : null
  return (
    <>
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      ) : null}
      {px ? (
        <Script id="meta-pixel" strategy="lazyOnload">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}</Script>
      ) : null}
    </>
  )
}
