import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";
import fs from "fs/promises";
import path from "path";

async function runSpeedTest() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse("http://localhost:5173", options);
  await chrome.kill();

  // Extract key metrics
  const lhr = runnerResult.lhr;
  const metrics = {
    "First Contentful Paint": lhr.audits["first-contentful-paint"].displayValue,
    "Largest Contentful Paint":
      lhr.audits["largest-contentful-paint"].displayValue,
    "Cumulative Layout Shift":
      lhr.audits["cumulative-layout-shift"].displayValue,
    "First Input Delay": lhr.audits["max-potential-fid"].displayValue,
    "Speed Index": lhr.audits["speed-index"].displayValue,
    "Time to Interactive": lhr.audits["interactive"].displayValue,
    "Total Blocking Time": lhr.audits["total-blocking-time"].displayValue,
    "Performance Score": lhr.categories.performance.score * 100,
  };

  console.log("\n📊 Performance Metrics:");
  console.log("========================");
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  // Save detailed report
  await fs.mkdir("./performance-reports", { recursive: true });
  await fs.writeFile(
    "./performance-reports/speed-test-report.json",
    JSON.stringify(
      { timestamp: new Date().toISOString(), metrics, fullReport: lhr },
      null,
      2
    )
  );

  console.log(
    "\n📋 Detailed report saved to: ./performance-reports/speed-test-report.json"
  );

  // Performance recommendations
  console.log("\n💡 Performance Recommendations:");
  console.log("================================");

  const recommendations = [];

  if (lhr.categories.performance.score < 0.9) {
    recommendations.push(
      "🚀 Performance score is below 90. Consider optimizing assets and code."
    );
  }

  if (parseFloat(lhr.audits["largest-contentful-paint"].numericValue) > 2500) {
    recommendations.push(
      "🖼️  Largest Contentful Paint is slow. Optimize images and critical CSS."
    );
  }

  if (parseFloat(lhr.audits["cumulative-layout-shift"].numericValue) > 0.1) {
    recommendations.push(
      "📐 Cumulative Layout Shift is high. Add size attributes to images and media."
    );
  }

  if (parseFloat(lhr.audits["total-blocking-time"].numericValue) > 300) {
    recommendations.push(
      "⏱️  Total Blocking Time is high. Split code and defer non-critical JS."
    );
  }

  recommendations.forEach((rec) => console.log(rec));

  if (recommendations.length === 0) {
    console.log("✅ Great job! Your performance metrics look good!");
  }
}

if (require.main === module) {
  runSpeedTest().catch(console.error);
}

module.exports = runSpeedTest;
