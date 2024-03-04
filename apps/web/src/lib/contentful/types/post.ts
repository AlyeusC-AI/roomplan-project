interface Post {
  author: {
    name: string
    title: string
    image: {
      url: string
    }
  }
  content: { json: any }
  date: string
  excerpt: string
  image: {
    url: string
  }
  slug: string
  title: string
  category: { name: string }
  readingTime: string
}

export default Post
