import Blog from '@components/Blog'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import { getAllPostsForHome } from '@lib/contentful/api'
import Post from '@lib/contentful/types/post'
import Head from 'next/head'

export default function BlogPage({ allPosts }: { allPosts: Post[] }) {
  return (
    <>
      <Head>
        <title>RestorationX - Blog</title>
        <meta
          name="description"
          content="Read about how we are revolutionizing the restoration industry"
        />
      </Head>
      <Header />
      <main>
        <Blog posts={allPosts} />
      </main>
      <Footer />
    </>
  )
}

export async function getStaticProps({ preview = false }) {
  const allPosts = (await getAllPostsForHome(preview)) ?? []
  return {
    props: { preview, allPosts },
  }
}
