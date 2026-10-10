import type { Metadata } from 'next'

import { BlogCard } from '@/components/blocks/home'
import { Pagination } from '@/components/catalog/Pagination'
import { getBlogPosts } from '@/lib/data/content'

export const metadata: Metadata = { title: 'Car maintenance tips & guides', description: 'Practical car-care advice for Pakistani roads from the Partsyaar parts experts.' }

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const res = await getBlogPosts(12, page)
  return (
    <div className="pb-16">
      <div className="bg-hero text-white">
        <div className="container-py py-12">
          <h1 className="text-4xl md:text-6xl">Maintenance tips</h1>
          <p className="mt-2 text-steel-400">Straight answers from people who sell car parts every day.</p>
        </div>
      </div>
      <div className="container-py pt-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {res.docs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <Pagination page={res.page ?? 1} pages={res.totalPages} basePath="/blog" searchParams={{}} />
      </div>
    </div>
  )
}
