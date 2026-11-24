import { MetadataRoute } from 'next'
import { fetchPublishedBlogsForSitemap } from '@/modules/blog/utils/blog-seo.server'
import { fetchOpenJobsForSitemap } from '@/modules/career/utils/career-seo.server'

// Rebuilt at most every 5 minutes, so newly published posts show up without a deploy.
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://naturacarebd.com'

  // `updatedAt` only moves on editorial changes (not views or comments), so
  // it is an honest lastModified for search engines.
  const blogPosts: MetadataRoute.Sitemap = (
    await fetchPublishedBlogsForSitemap()
  ).map((post) => ({
    url: `${baseUrl}/blog-details/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Only open jobs are listed; a job drops out once its deadline passes.
  const jobPosts: MetadataRoute.Sitemap = (await fetchOpenJobsForSitemap()).map(
    (job) => ({
      url: `${baseUrl}/career-details/${job.slug}`,
      lastModified: new Date(job.updatedAt ?? job.createdAt),
      changeFrequency: 'weekly',
      priority: 0.5,
    }),
  )

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/media-news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/create-account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/career`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...blogPosts,
    ...jobPosts,
  ]
}
