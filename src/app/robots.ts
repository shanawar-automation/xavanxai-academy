// // src/app/robots.ts
// import type { MetadataRoute } from "next";

// export default function robots(): MetadataRoute.Robots {
//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xavanxai.com";
//   return {
//     rules: {
//       userAgent: "*",
//       allow: "/",
//       disallow: ["/dashboard/", "/interview/", "/api/"],
//     },
//     sitemap: `${baseUrl}/sitemap.xml`,
//   };
// }


import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xavanxai.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/apply/", "/interview/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}