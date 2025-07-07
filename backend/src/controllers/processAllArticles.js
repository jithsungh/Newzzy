const NewsArticles = require("../models/newsArticles");
const { preprocessArticle } = require("./preprocessArticle");
const { processArticle } = require("./processArticle");

const processAllArticles = async () => {
  // fetch all articles
  const articles = await NewsArticles.find({});
  if (!articles || articles.length === 0) {
    console.log("No articles found to process.");
    return;
  }

  // process and preprocess
  for (const article of articles) {
    try {
      // preprocess the article
      const preprocessedContent = await preprocessArticle(article);
      if (!preprocessedContent) {
        console.log(
          `Skipping article ${article._id} due to preprocessing failure.`
        );
        continue;
      }

      // Extract high-quality single-word keywords using the improved system
      const processedKeywords = processArticle(
        article, // Pass the full article for advanced extraction
        preprocessedContent,
        article.article_id
      );

      console.log(`Keywords for: ${article.title}`);
      console.log("Extracted single-word keywords:", processedKeywords);

      // Only use high-quality single-word keywords (strict filtering)
      const finalKeywords = processedKeywords
        .filter(
          (keyword) =>
            keyword &&
            typeof keyword === "string" &&
            !keyword.includes(" ") && // Ensure single words only
            keyword.length >= 4 &&
            keyword.length <= 15 &&
            /^[a-zA-Z]+$/.test(keyword) // Only alphabetic characters
        )
        .slice(0, 8); // Limit to max 8 keywords

      article.keywords = finalKeywords;
      article.preprocessedContent = preprocessedContent;

      // save the processed article back to the database
      await NewsArticles.updateOne(
        { _id: article._id },
        {
          $set: {
            keywords: finalKeywords,
            preprocessedContent: preprocessedContent,
          },
        }
      );
      console.log(
        `Processed and saved article ${article._id.toString()} with ${
          finalKeywords.length
        } keywords`
      );
    } catch (error) {
      console.error(
        `Error processing article ${article._id.toString()}:`,
        error
      );
    }
  }
};

module.exports = { processAllArticles };
