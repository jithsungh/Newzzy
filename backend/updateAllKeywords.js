const mongoose = require("mongoose");
const { NewsArticle } = require("./src/models/newsArticles");
const {
  AdvancedKeywordExtractor,
} = require("./src/controllers/advancedKeywordExtractor");

async function updateAllArticleKeywords() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/news-aggregator");
    console.log("🔌 Connected to MongoDB");

    const extractor = new AdvancedKeywordExtractor();

    // Get all articles
    const totalArticles = await NewsArticle.countDocuments();
    console.log(`📊 Found ${totalArticles} articles to update`);

    if (totalArticles === 0) {
      console.log("❌ No articles found in database");
      return;
    }

    // Process articles in batches to avoid memory issues
    const batchSize = 100;
    let processed = 0;
    let improved = 0;

    for (let skip = 0; skip < totalArticles; skip += batchSize) {
      const articles = await NewsArticle.find({}).skip(skip).limit(batchSize);

      console.log(
        `\n🔄 Processing batch ${Math.floor(skip / batchSize) + 1}/${Math.ceil(
          totalArticles / batchSize
        )}`
      );

      for (const article of articles) {
        try {
          // Extract improved keywords
          const newKeywords = extractor.extractKeywords(article, 8);

          // Only update if we got good keywords
          if (newKeywords.length > 0) {
            await NewsArticle.findByIdAndUpdate(article._id, {
              keywords: newKeywords,
            });
            improved++;

            console.log(
              `✅ Updated: ${article.title?.substring(0, 50)}... | Keywords: ${
                newKeywords.length
              }`
            );
          } else {
            console.log(
              `⚠️  Skipped: ${article.title?.substring(
                0,
                50
              )}... | No good keywords found`
            );
          }

          processed++;

          // Show progress
          if (processed % 25 === 0) {
            console.log(
              `📈 Progress: ${processed}/${totalArticles} (${Math.round(
                (processed / totalArticles) * 100
              )}%)`
            );
          }
        } catch (error) {
          console.error(
            `❌ Error processing article ${article._id}:`,
            error.message
          );
        }
      }
    }

    console.log(`\n✅ Bulk update completed!`);
    console.log(`📊 Processed: ${processed} articles`);
    console.log(`🎯 Improved: ${improved} articles`);
    console.log(
      `⚡ Success rate: ${Math.round((improved / processed) * 100)}%`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Show usage instructions
console.log("🚀 Advanced Keyword Extraction - Bulk Update Tool");
console.log("━".repeat(60));
console.log(
  "This script will update ALL articles in your database with improved keywords."
);
console.log("Make sure MongoDB is running before executing this script.");
console.log("");
console.log("To run: node updateAllKeywords.js");
console.log("To test first: node testRealArticles.js");
console.log("━".repeat(60));

// Uncomment the line below to run the bulk update
// updateAllArticleKeywords();

module.exports = { updateAllArticleKeywords };
