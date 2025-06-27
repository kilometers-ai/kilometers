import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const posts = [
    {
      title: "The Future of AI Agent Monitoring",
      excerpt: "Why monitoring your AI agents is becoming critical as AI adoption accelerates in 2024.",
      author: "Miles Chen",
      date: "Dec 20, 2024",
      readTime: "5 min read",
      category: "Industry",
      slug: "future-of-ai-agent-monitoring",
      featured: true,
    },
    {
      title: "How to Prevent $50K AI Bills",
      excerpt: "Real case studies of AI cost overruns and how proper monitoring could have prevented them.",
      author: "Sarah Kim",
      date: "Dec 18, 2024",
      readTime: "7 min read",
      category: "Cost Management",
      slug: "prevent-ai-cost-overruns",
      featured: false,
    },
    {
      title: "Setting Up Cursor with Kilometers",
      excerpt: "Complete guide to monitoring your Cursor AI requests with step-by-step instructions.",
      author: "Alex Rodriguez",
      date: "Dec 15, 2024",
      readTime: "4 min read",
      category: "Tutorial",
      slug: "cursor-setup-guide",
      featured: false,
    },
    {
      title: "AI Security Best Practices",
      excerpt: "Essential security considerations when deploying AI agents in production environments.",
      author: "Miles Chen",
      date: "Dec 12, 2024",
      readTime: "6 min read",
      category: "Security",
      slug: "ai-security-best-practices",
      featured: false,
    },
    {
      title: "Understanding MCP Protocol",
      excerpt: "Deep dive into the Model Context Protocol and how it enables AI agent monitoring.",
      author: "Jordan Lee",
      date: "Dec 10, 2024",
      readTime: "8 min read",
      category: "Technical",
      slug: "understanding-mcp-protocol",
      featured: false,
    },
  ]

  const categories = ["All", "Industry", "Tutorial", "Security", "Cost Management", "Technical"]

  const featuredPost = posts.find((post) => post.featured)
  const regularPosts = posts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#18181B] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold">Kilometers</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/docs">Docs</Link>
              </Button>
              <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            AI Monitoring <span className="text-[#0EA5E9]">Insights</span>
          </h1>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Latest thoughts on AI agent monitoring, cost optimization, and best practices from the Kilometers team.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Card className="bg-[#18181B] border-[#0EA5E9]/20 mb-12">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-[#0EA5E9]/20 text-[#0EA5E9] mb-4">Featured</Badge>
                  <h2 className="text-3xl font-bold mb-4 hover:text-[#0EA5E9] transition-colors cursor-pointer">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>
                  <p className="text-[#FAFAFA]/80 mb-6 text-lg leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center space-x-6 text-sm text-[#FAFAFA]/60 mb-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-[#0EA5E9]/10 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-[#FAFAFA]/70">Featured insights on AI monitoring trends and best practices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "ghost"}
              size="sm"
              className={category === "All" ? "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90" : "hover:bg-[#0EA5E9]/10"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <Card
              key={index}
              className="bg-[#18181B] border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors cursor-pointer group"
            >
              <CardHeader>
                <Badge variant="secondary" className="bg-[#0EA5E9]/20 text-[#0EA5E9] w-fit">
                  {post.category}
                </Badge>
                <CardTitle className="group-hover:text-[#0EA5E9] transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </CardTitle>
                <CardDescription className="text-[#FAFAFA]/70">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-[#FAFAFA]/60">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-[#18181B] border-[#0EA5E9]/20 mt-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-[#FAFAFA]/70 mb-6 max-w-2xl mx-auto">
              Get the latest insights on AI monitoring, cost optimization tips, and industry best practices delivered to
              your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#0EA5E9]/20 rounded-lg text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9] focus:outline-none"
              />
              <Button className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">Subscribe</Button>
            </div>
            <p className="text-xs text-[#FAFAFA]/60 mt-3">No spam. Unsubscribe anytime.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
