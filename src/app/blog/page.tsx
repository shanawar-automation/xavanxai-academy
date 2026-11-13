import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { BLOG_ARTICLES } from "@/data/blogArticles";
import { SectionHeader } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Engineering & AI Architecture Blog — XavanXAI",
  description:
    "Technical publications on multi-agent orchestration, ethical AI recruitment, and enterprise n8n automation architecture.",
};

export default function BlogIndexPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-5xl">
        <SectionHeader
          eyebrow="Technical Publications"
          title="XavanXAI Engineering &amp; AI Governance Journal"
          description="Architectural blueprints, security patterns, and ethical AI research from our autonomous systems team."
        />

        <div className="mt-12 space-y-6">
          {BLOG_ARTICLES.map((post) => (
            <article
              key={post.slug}
              className="xavan-card p-7 sm:p-8 transition-colors hover:border-[#F47735]/50"
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#F47735]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {post.category}
                </span>
                <span className="text-[#A1A1AA]">• {post.publishedAt}</span>
                <span className="text-[#A1A1AA]">• {post.readTime}</span>
              </div>

              <h2 className="mt-3 font-display text-2xl font-bold text-white">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-[#F47735] transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                {post.excerpt}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                <span className="font-mono text-[#A1A1AA]">{post.author}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#F47735] hover:underline"
                >
                  Read Technical Paper
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}