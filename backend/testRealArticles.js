const mongoose = require("mongoose");
const { NewsArticle } = require("./src/models/newsArticles");
const {
  AdvancedKeywordExtractor,
} = require("./src/controllers/advancedKeywordExtractor");

async function testRealArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/news-aggregator", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🔌 Connected to MongoDB");

    // Get some sample articles from your database
    const articles = await NewsArticle.find({}).limit(5);

    if (articles.length === 0) {
      console.log("❌ No articles found in database");
      return;
    }

    console.log(`📊 Found ${articles.length} articles in database\n`);

    const extractor = new AdvancedKeywordExtractor();

    // Test keyword extraction on real articles
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const keywords = extractor.extractKeywords(article, 8);

      console.log(`📰 Article ${i + 1}: ${article.title?.substring(0, 80)}...`);
      console.log(`🎯 Keywords: [${keywords.map((k) => `'${k}'`).join(", ")}]`);
      console.log("━".repeat(80));
    }

    // Update one article to show the improvement
    const firstArticle = articles[0];
    const newKeywords = extractor.extractKeywords(firstArticle, 8);

    console.log(
      `\n🔄 Updating article: ${firstArticle.title?.substring(0, 50)}...`
    );
    console.log(
      `📝 Old keywords: [${firstArticle.keywords?.join(", ") || "none"}]`
    );
    console.log(`✨ New keywords: [${newKeywords.join(", ")}]`);

    // Update the article in database
    await NewsArticle.findByIdAndUpdate(firstArticle._id, {
      keywords: newKeywords,
    });

    console.log("✅ Article updated successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testRealArticles();
