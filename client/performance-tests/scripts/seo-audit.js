import puppeteer from "puppeteer";
import fs from "fs/promises";

async function runSEOAudit() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set user agent to simulate Googlebot
  await page.setUserAgent(
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  );

  console.log("🔍 Running SEO Audit...");
  console.log("=======================");

  try {
    await page.goto("http://localhost:5173", { waitUntil: "networkidle2" });

    const seoChecks = await page.evaluate(() => {
      const results = {
        title: {
          exists: !!document.querySelector("title"),
          content: document.querySelector("title")?.textContent || "",
          length: document.querySelector("title")?.textContent?.length || 0,
        },
        metaDescription: {
          exists: !!document.querySelector('meta[name="description"]'),
          content:
            document
              .querySelector('meta[name="description"]')
              ?.getAttribute("content") || "",
          length:
            document
              .querySelector('meta[name="description"]')
              ?.getAttribute("content")?.length || 0,
        },
        headings: {
          h1Count: document.querySelectorAll("h1").length,
          h2Count: document.querySelectorAll("h2").length,
          h3Count: document.querySelectorAll("h3").length,
          h1Text: Array.from(document.querySelectorAll("h1")).map((h) =>
            h.textContent.trim()
          ),
        },
        images: {
          total: document.querySelectorAll("img").length,
          withAlt: document.querySelectorAll("img[alt]").length,
          withoutAlt: document.querySelectorAll("img:not([alt])").length,
          withEmptyAlt: document.querySelectorAll('img[alt=""]').length,
        },
        links: {
          total: document.querySelectorAll("a").length,
          internal: document.querySelectorAll(
            'a[href^="/"], a[href^="#"], a[href*="localhost"]'
          ).length,
          external: document.querySelectorAll(
            'a[href^="http"]:not([href*="localhost"])'
          ).length,
          withoutTitle: document.querySelectorAll("a:not([title])").length,
        },
        socialMeta: {
          ogTitle: !!document.querySelector('meta[property="og:title"]'),
          ogDescription: !!document.querySelector(
            'meta[property="og:description"]'
          ),
          ogImage: !!document.querySelector('meta[property="og:image"]'),
          ogUrl: !!document.querySelector('meta[property="og:url"]'),
          twitterCard: !!document.querySelector('meta[name="twitter:card"]'),
          twitterTitle: !!document.querySelector('meta[name="twitter:title"]'),
          twitterDescription: !!document.querySelector(
            'meta[name="twitter:description"]'
          ),
          twitterImage: !!document.querySelector('meta[name="twitter:image"]'),
        },
        structuredData: {
          jsonLd: document.querySelectorAll(
            'script[type="application/ld+json"]'
          ).length,
          schemas: Array.from(
            document.querySelectorAll('script[type="application/ld+json"]')
          ).map((script) => {
            try {
              const data = JSON.parse(script.textContent);
              return data["@type"] || "Unknown";
            } catch {
              return "Invalid JSON-LD";
            }
          }),
        },
        performance: {
          viewport: !!document.querySelector('meta[name="viewport"]'),
          canonical: !!document.querySelector('link[rel="canonical"]'),
          robots:
            document
              .querySelector('meta[name="robots"]')
              ?.getAttribute("content") || "Not set",
          lang: document.documentElement.lang || "Not set",
        },
      };

      return results;
    });

    // Generate SEO score and recommendations
    const score = calculateSEOScore(seoChecks);
    const recommendations = generateSEORecommendations(seoChecks);

    console.log(`\n📊 SEO Score: ${score}/100`);
    console.log("\n📋 SEO Audit Results:");
    console.log("======================");

    // Title analysis
    console.log(`\n📑 Title Tag:`);
    console.log(`   ✓ Exists: ${seoChecks.title.exists ? "Yes" : "No"}`);
    console.log(`   ✓ Content: "${seoChecks.title.content}"`);
    console.log(
      `   ✓ Length: ${seoChecks.title.length} characters ${
        seoChecks.title.length >= 30 && seoChecks.title.length <= 60
          ? "✅"
          : "⚠️"
      }`
    );

    // Meta description analysis
    console.log(`\n📝 Meta Description:`);
    console.log(
      `   ✓ Exists: ${seoChecks.metaDescription.exists ? "Yes" : "No"}`
    );
    console.log(
      `   ✓ Length: ${seoChecks.metaDescription.length} characters ${
        seoChecks.metaDescription.length >= 120 &&
        seoChecks.metaDescription.length <= 160
          ? "✅"
          : "⚠️"
      }`
    );

    // Headings analysis
    console.log(`\n📰 Headings Structure:`);
    console.log(
      `   ✓ H1 tags: ${seoChecks.headings.h1Count} ${
        seoChecks.headings.h1Count === 1 ? "✅" : "⚠️"
      }`
    );
    console.log(`   ✓ H2 tags: ${seoChecks.headings.h2Count}`);
    console.log(`   ✓ H3 tags: ${seoChecks.headings.h3Count}`);

    // Images analysis
    console.log(`\n🖼️  Images:`);
    console.log(`   ✓ Total images: ${seoChecks.images.total}`);
    console.log(
      `   ✓ With alt text: ${seoChecks.images.withAlt}/${
        seoChecks.images.total
      } ${seoChecks.images.withAlt === seoChecks.images.total ? "✅" : "⚠️"}`
    );
    console.log(`   ✓ Missing alt text: ${seoChecks.images.withoutAlt}`);

    // Social media meta tags
    console.log(`\n📱 Social Media Meta Tags:`);
    console.log(
      `   ✓ Open Graph Title: ${
        seoChecks.socialMeta.ogTitle ? "Yes ✅" : "No ⚠️"
      }`
    );
    console.log(
      `   ✓ Open Graph Description: ${
        seoChecks.socialMeta.ogDescription ? "Yes ✅" : "No ⚠️"
      }`
    );
    console.log(
      `   ✓ Open Graph Image: ${
        seoChecks.socialMeta.ogImage ? "Yes ✅" : "No ⚠️"
      }`
    );
    console.log(
      `   ✓ Twitter Card: ${
        seoChecks.socialMeta.twitterCard ? "Yes ✅" : "No ⚠️"
      }`
    );

    // Structured data
    console.log(`\n🏗️  Structured Data:`);
    console.log(`   ✓ JSON-LD scripts: ${seoChecks.structuredData.jsonLd}`);
    console.log(
      `   ✓ Schema types: ${
        seoChecks.structuredData.schemas.join(", ") || "None"
      }`
    );

    // Technical SEO
    console.log(`\n⚙️  Technical SEO:`);
    console.log(
      `   ✓ Viewport meta tag: ${
        seoChecks.performance.viewport ? "Yes ✅" : "No ⚠️"
      }`
    );
    console.log(
      `   ✓ Canonical URL: ${
        seoChecks.performance.canonical ? "Yes ✅" : "No ⚠️"
      }`
    );
    console.log(
      `   ✓ Language attribute: ${
        seoChecks.performance.lang !== "Not set"
          ? seoChecks.performance.lang + " ✅"
          : "Not set ⚠️"
      }`
    );
    console.log(`   ✓ Robots meta: ${seoChecks.performance.robots}`);

    // Recommendations
    console.log(`\n💡 SEO Recommendations:`);
    console.log("========================");
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Save detailed report
    await fs.mkdir("./performance-reports", { recursive: true });
    await fs.writeFile(
      "./performance-reports/seo-audit-report.json",
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          score,
          checks: seoChecks,
          recommendations,
        },
        null,
        2
      )
    );

    console.log(
      "\n📋 Detailed SEO report saved to: ./performance-reports/seo-audit-report.json"
    );
  } catch (error) {
    console.error("Error during SEO audit:", error);
  } finally {
    await browser.close();
  }
}

function calculateSEOScore(checks) {
  let score = 0;
  let maxScore = 0;

  // Title (15 points)
  maxScore += 15;
  if (checks.title.exists) score += 5;
  if (checks.title.length >= 30 && checks.title.length <= 60) score += 10;

  // Meta description (15 points)
  maxScore += 15;
  if (checks.metaDescription.exists) score += 5;
  if (
    checks.metaDescription.length >= 120 &&
    checks.metaDescription.length <= 160
  )
    score += 10;

  // Headings (10 points)
  maxScore += 10;
  if (checks.headings.h1Count === 1) score += 10;

  // Images (10 points)
  maxScore += 10;
  if (checks.images.total > 0 && checks.images.withAlt === checks.images.total)
    score += 10;

  // Social meta (20 points)
  maxScore += 20;
  if (checks.socialMeta.ogTitle) score += 5;
  if (checks.socialMeta.ogDescription) score += 5;
  if (checks.socialMeta.ogImage) score += 5;
  if (checks.socialMeta.twitterCard) score += 5;

  // Structured data (15 points)
  maxScore += 15;
  if (checks.structuredData.jsonLd > 0) score += 15;

  // Technical SEO (15 points)
  maxScore += 15;
  if (checks.performance.viewport) score += 5;
  if (checks.performance.canonical) score += 5;
  if (checks.performance.lang !== "Not set") score += 5;

  return Math.round((score / maxScore) * 100);
}

function generateSEORecommendations(checks) {
  const recommendations = [];

  if (!checks.title.exists) {
    recommendations.push("Add a title tag to your page");
  } else if (checks.title.length < 30 || checks.title.length > 60) {
    recommendations.push(
      "Optimize title tag length (30-60 characters recommended)"
    );
  }

  if (!checks.metaDescription.exists) {
    recommendations.push("Add a meta description tag");
  } else if (
    checks.metaDescription.length < 120 ||
    checks.metaDescription.length > 160
  ) {
    recommendations.push(
      "Optimize meta description length (120-160 characters recommended)"
    );
  }

  if (checks.headings.h1Count !== 1) {
    recommendations.push("Use exactly one H1 tag per page");
  }

  if (checks.images.withoutAlt > 0) {
    recommendations.push(`Add alt text to ${checks.images.withoutAlt} images`);
  }

  if (!checks.socialMeta.ogTitle) {
    recommendations.push("Add Open Graph title meta tag");
  }

  if (!checks.socialMeta.ogDescription) {
    recommendations.push("Add Open Graph description meta tag");
  }

  if (!checks.socialMeta.ogImage) {
    recommendations.push("Add Open Graph image meta tag");
  }

  if (!checks.socialMeta.twitterCard) {
    recommendations.push("Add Twitter Card meta tags");
  }

  if (checks.structuredData.jsonLd === 0) {
    recommendations.push(
      "Add structured data (JSON-LD) for better search results"
    );
  }

  if (!checks.performance.viewport) {
    recommendations.push("Add viewport meta tag for mobile responsiveness");
  }

  if (!checks.performance.canonical) {
    recommendations.push(
      "Add canonical URL to prevent duplicate content issues"
    );
  }

  if (checks.performance.lang === "Not set") {
    recommendations.push("Add lang attribute to html element");
  }

  return recommendations;
}

if (require.main === module) {
  runSEOAudit().catch(console.error);
}

module.exports = runSEOAudit;
