import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/my-account/',
        '/check-out/',
        '/my-cart/',
        '/order-details/',
        '/otp-verification/',
        '/api/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: 'https://naturacarebd.com/sitemap.xml',
  }
}
