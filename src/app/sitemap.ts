// // src/app/sitemap.ts
// import type { MetadataRoute } from "next";
// import { SERVICES_CATALOG, OPEN_POSITIONS } from "@/data/xavanData";

// export default function sitemap(): MetadataRoute.Sitemap {
//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xavanxai.com";

//   const staticRoutes = [
//     "",
//     "/about",
//     "/services",
//     "/ai-agents",
//     "/ai-tools",
//     "/ai-headquarters",
//     "/recruitment",
//     "/careers",
//     "/pricing",
//     "/book-consultation",
//     "/contact",
//     "/privacy",
//     "/terms",
//   ].map((route) => ({
//     url: `${baseUrl}${route}`,
//     lastModified: new Date(),
//     changeFrequency: "weekly" as const,
//     priority: route === "" ? 1.0 : 0.8,
//   }));

//   const serviceRoutes = SERVICES_CATALOG.map((s) => ({
//     url: `${baseUrl}/services/${s.slug}`,
//     lastModified: new Date(),
//     changeFrequency: "weekly" as const,
//     priority: 0.7,
//   }));

//   const jobRoutes = OPEN_POSITIONS.map((j) => ({
//     url: `${baseUrl}/careers/${j.slug}`,
//     lastModified: new Date(),
//     changeFrequency: "daily" as const,
//     priority: 0.7,
//   }));

//   return [...staticRoutes, ...serviceRoutes, ...jobRoutes];
// }

import type { MetadataRoute } from "next";
import { SERVICES_CATALOG, OPEN_POSITIONS } from "@/data/xavanData";
import { BLOG_ARTICLES } from "@/data/blogArticles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xavanxai.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/ai-headquarters",
    "/ai-tools",
    "/recruitment",
    "/careers",
    "/clients",
    "/book-consultation",
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const serviceRoutes = SERVICES_CATALOG.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const careerRoutes = OPEN_POSITIONS.map((pos) => ({
    url: `${baseUrl}/careers/${pos.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const blogRoutes = BLOG_ARTICLES.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...careerRoutes, ...blogRoutes];
}