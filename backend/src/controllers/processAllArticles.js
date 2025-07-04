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

      const processedKeywords = processArticle(
        preprocessedContent,
        article.article_id
      );
      //   console.log(`Keywords for: ${article.title}`);
      //   console.log(processedKeywords);

      // save article
      const allKeywords = [
        ...processedKeywords,
        ...(article.keywords || []),
        ...(article.category || []),
      ];
      let uniqueKeywords = [];
      for (const kw of allKeywords) {
        if (kw && !uniqueKeywords.includes(kw.toLowerCase()) && kw.length > 2) {
          uniqueKeywords.push(kw.toLowerCase());
        }
      }
      article.keywords = uniqueKeywords;
      article.preprocessedContent = preprocessedContent;

      // save the processed article back to the database
      await NewsArticles.updateOne({ _id: article._id }, { $set: article });
      console.log(`Processed and saved article ${article._id.toString()}`);
    } catch (error) {
      console.error(
        `Error processing article ${article._id.toString()}:`,
        error
      );
    }
  }
};

module.exports = { processAllArticles };
