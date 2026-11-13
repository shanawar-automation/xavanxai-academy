import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { BLOG_ARTICLES } from "@/data/blogArticles";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = BLOG_ARTICLES.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.excerpt } : { title: "Article not found" };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) return notFound();

  return (
    <div className="py-16 lg:py-24">
      <article className="xavan-container max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#F47735] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Engineering Journal
        </Link>

        <div className="mt-6 font-mono text-xs text-[#A1A1AA]">
          {article.category} • {article.publishedAt} • {article.readTime}
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
          {article.excerpt}
        </p>

        <div className="mt-8 space-y-8 border-t border-white/10 pt-8">
          {article.sections.map((sec) => (
            <section key={sec.heading} className="space-y-3">
              <h2 className="font-display text-xl font-bold text-white">
                {sec.heading}
              </h2>
              <p className="text-sm leading-relaxed text-white/85">
                {sec.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}