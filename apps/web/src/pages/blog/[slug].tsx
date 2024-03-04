import Container from '@components/Blog/Container'
import MoreStories from '@components/Blog/MoreStories'
import PostBody from '@components/Blog/PostBody'
import PostHeader from '@components/Blog/PostHeader'
import PostTitle from '@components/Blog/PostTitle'
import SectionSeparator from '@components/Blog/SectionSeparator'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import { getAllPostsWithSlug, getPostAndMorePosts } from '@lib/contentful/api'
import Post from '@lib/contentful/types/post'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function BlogPage({
  post,
  morePosts,
}: {
  post: Post
  morePosts: Post[]
}) {
  const router = useRouter()

  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />
  }

  if (!post) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <>
      <Head>
        <title>{post.title} | RestorationX Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>
      <Header />
      <main>
        <Container>
          {router.isFallback ? (
            <PostTitle>Loading…</PostTitle>
          ) : (
            <>
              <article>
                <PostHeader
                  title={post.title}
                  coverImage={post.image}
                  date={post.date}
                  author={post.author}
                />
                <PostBody content={post.content} />
              </article>
              <SectionSeparator />
              {morePosts && morePosts.length > 0 && (
                <MoreStories posts={morePosts} />
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </>
  )
}

// @ts-expect-error
export async function getStaticProps({ params, preview = false }) {
  const data = await getPostAndMorePosts(params.slug, preview)

  return {
    props: {
      preview,
      post: data?.post ?? null,
      morePosts: data?.morePosts ?? null,
    },
  }
}

export async function getStaticPaths() {
  const allPosts = await getAllPostsWithSlug()
  return {
    paths: allPosts?.map(({ slug }) => `/blog/${slug}`) ?? [],
    fallback: true,
  }
}
