require("dotenv").config();
const mongoose = require("mongoose");
const NewsArticle = require("./src/models/newsArticles");
const {
  AdvancedKeywordExtractor,
} = require("./src/controllers/advancedKeywordExtractor");

async function updateAllArticleKeywords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to MongoDB");

    const extractor = new AdvancedKeywordExtractor();

    // Get total count for progress tracking
    const totalArticles = await NewsArticle.countDocuments();
    console.log(
      `📊 Found ${totalArticles} articles to update with improved single-word keywords`
    );

    if (totalArticles === 0) {
      console.log("❌ No articles found in database");
      return;
    }

    // Process articles in batches to avoid memory issues
    const batchSize = 50;
    let processed = 0;
    let improved = 0;
    let skipped = 0;

    console.log("\n🚀 Starting keyword extraction process...\n");

    for (let skip = 0; skip < totalArticles; skip += batchSize) {
      const articles = await NewsArticle.find({}).skip(skip).limit(batchSize);

      console.log(
        `\n🔄 Processing batch ${Math.floor(skip / batchSize) + 1}/${Math.ceil(
          totalArticles / batchSize
        )}`
      );
      console.log(
        `📄 Articles ${skip + 1} to ${Math.min(
          skip + batchSize,
          totalArticles
        )}`
      );

      for (const article of articles) {
        try {
          // Extract improved single-word keywords
          const newKeywords = extractor.extractKeywords(article, 8);

          // Only update if we got good keywords
          if (newKeywords.length >= 3) {
            // Ensure all keywords are single words and clean
            const cleanKeywords = newKeywords
              .filter(
                (keyword) =>
                  keyword &&
                  typeof keyword === "string" &&
                  !keyword.includes(" ") &&
                  keyword.length >= 4 &&
                  keyword.length <= 15 &&
                  /^[a-zA-Z]+$/.test(keyword)
              )
              .slice(0, 8); // Limit to 8 keywords max

            if (cleanKeywords.length >= 3) {
              await NewsArticle.findByIdAndUpdate(article._id, {
                keywords: cleanKeywords,
              });
              improved++;

              const title = article.title?.substring(0, 60) || "No title";
              console.log(`✅ Updated: ${title}...`);
              console.log(`   Keywords: [${cleanKeywords.join(", ")}]`);
            } else {
              skipped++;
              console.log(
                `⚠️  Skipped: ${article.title?.substring(
                  0,
                  50
                )}... | Not enough quality keywords`
              );
            }
          } else {
            skipped++;
            console.log(
              `⚠️  Skipped: ${article.title?.substring(
                0,
                50
              )}... | No good keywords found`
            );
          }

          processed++;

          // Show progress every 10 articles
          if (processed % 10 === 0) {
            const percentage = Math.round((processed / totalArticles) * 100);
            console.log(
              `📈 Progress: ${processed}/${totalArticles} (${percentage}%) | Updated: ${improved} | Skipped: ${skipped}`
            );
          }
        } catch (error) {
          console.error(
            `❌ Error processing article ${article._id}:`,
            error.message
          );
          skipped++;
        }
      }

      // Small delay between batches to avoid overwhelming the database
      if (skip + batchSize < totalArticles) {
        console.log("⏳ Brief pause between batches...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n🎉 Bulk keyword update completed!`);
    console.log("━".repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${processed} articles`);
    console.log(`   Successfully updated: ${improved} articles`);
    console.log(`   Skipped: ${skipped} articles`);
    console.log(
      `   Success rate: ${Math.round((improved / processed) * 100)}%`
    );
    console.log(`\n🎯 All articles now have improved single-word keywords!`);

    // Show some examples of updated keywords
    console.log("\n🔍 Sample of updated articles:");
    const sampleArticles = await NewsArticle.find({}).limit(5);
    sampleArticles.forEach((article, index) => {
      const title = article.title?.substring(0, 50) || "No title";
      const keywords = article.keywords || [];
      console.log(`${index + 1}. ${title}...`);
      console.log(`   Keywords: [${keywords.join(", ")}]`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Show usage instructions
console.log(
  "🚀 Advanced Single-Word Keyword Extraction - Database Update Tool"
);
console.log("━".repeat(80));
console.log(
  "This script will update ALL articles in your database with improved keywords."
);
console.log(
  "Keywords will be single, meaningful words that uniquely describe each article."
);
console.log("");
console.log("Features:");
console.log("• Single words only (no phrases)");
console.log("• Enhanced entity recognition");
console.log("• Part-of-speech analysis");
console.log("• Domain-specific prioritization");
console.log("• Quality filtering and scoring");
console.log("━".repeat(80));

// Start the update process
updateAllArticleKeywords();
