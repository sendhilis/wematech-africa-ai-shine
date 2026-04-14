import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import blogImage from "@/assets/blog-ai-core-banking-nigeria.webp";
import blogImage2 from "@/assets/blog-mobile-money-kenya.webp";

const blogPosts = [
  {
    slug: "mobile-money-financial-inclusion-kenya",
    title: "How Mobile Money Infrastructure is Driving Financial Inclusion in Kenya",
    excerpt:
      "Kenya did not wait for traditional banks to solve financial inclusion. It built something better. Discover how M-Pesa's mobile money infrastructure is reshaping financial services across Africa.",
    image: blogImage2,
    author: "Wematech Africa",
    date: "April 2026",
    readTime: "9 min read",
    tags: ["Mobile Money", "Kenya", "Financial Inclusion", "M-Pesa"],
  },
  {
    slug: "ai-transforming-core-banking-nigeria",
    title: "How AI is Transforming Core Banking in Nigeria",
    excerpt:
      "Nigeria's banking sector is at an inflection point. With over 133 million financially excluded adults and one of Africa's most dynamic fintech ecosystems, AI is quietly reshaping how banks operate.",
    image: blogImage,
    author: "Wematech Africa",
    date: "April 2026",
    readTime: "8 min read",
    tags: ["AI Banking", "Nigeria", "Core Banking", "Fintech"],
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>Blog | Wematech Africa — AI Banking Insights for Africa</title>
        <meta
          name="description"
          content="Expert insights on AI-powered banking technology, digital transformation, and fintech innovation across Africa from the Wematech Africa team."
        />
        <link rel="canonical" href="https://www.wematech.in/blog" />
      </Helmet>
      <Navbar />

      <section className="pt-32 pb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[200px]" />
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
              Blog
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Insights & Perspectives
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert analysis on AI, banking technology, and digital
              transformation across Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="glass-card-hover overflow-hidden group flex flex-col"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={1200}
                    height={630}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Blog;
