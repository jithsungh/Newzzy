const axios = require("axios");
const mongoose = require("mongoose");
const cron = require("node-cron");

const NewsArticle = require("../models/newsArticles.js");
const { preprocessArticle } = require("./preprocessArticle");
const { processArticle } = require("./processArticle");
const { APIKeyManager } = require("../utils/apiKeyManager");

// Initialize API Key Manager
const apiManager = new APIKeyManager();

const fetchAndStoreNews = async () => {
  try {
    console.log("📰 Fetching news articles...");
    const keywords = [
      "politics",
      "world",
      "business",
      "technology",
      "science",
      "health",
      "sports",
      "entertainment",
      "finance",
      "education",
      "crime",
      "climate change",
      "economy",
      "elections",
      "covid-19",
      "travel",
      "weather",
      "startup",
      "law",
      "culture",
    ];

    console.log("Top keywords:", keywords);
    if (keywords.length === 0) {
      console.log("No keywords found for fetching news.");
      return;
    }

    for (const keyword of keywords) {
      console.log(`📰 Fetching articles for keyword: ${keyword}`);

      try {
        // Use API Key Manager for automatic key swapping
        const response = await apiManager.makeRequest(
          "https://newsdata.io/api/1/latest",
          {
            q: keyword,
            language: "en",
          }
        );

        const articles = response.data.results;
        console.log(
          `📄 Found ${articles.length} articles for keyword: ${keyword}`
        );

        for (const article of articles) {
          if (
            !article.article_id ||
            !article.title ||
            !article.description ||
            !article.image_url
          )
            continue;

          const exists = await NewsArticle.findOne({
            $or: [
              { article_id: article.article_id },
              { title: article.title },
              { image_url: article.image_url },
            ],
          });

          if (exists) {
            if (!exists.keywords.includes(keyword)) {
              exists.keywords.push(keyword);
              await exists.save();
              console.log(`✅ Updated keywords for: ${article.title}`);
            }
            continue;
          }
          if (article.keywords && !article.keywords.includes(keyword)) {
            article.keywords.push(keyword);
          }
          // preprocess
          const preprocessedContent = preprocessArticle(article);
          console.log(`Preprocessed content for: ${article.title}`);
          //process keywords using improved single-word system
          const processedKeywords = processArticle(
            article, // Pass full article for advanced extraction
            preprocessedContent,
            article.article_id
          );
          console.log(`Keywords for: ${article.title}`);
          console.log("Extracted single-word keywords:", processedKeywords);

          // Use only high-quality single-word keywords
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

          const doc = new NewsArticle({
            article_id: article.article_id,
            title: article.title,
            link: article.link,
            preprocessedContent: preprocessedContent,
            keywords: finalKeywords,
            creator: article.creator || [],
            description: article.description || "",
            content: article.content || "",
            pubDate: new Date(article.pubDate),
            image_url: article.image_url || "",
            source_id: article.source_id,
            source_name: article.source_name,
            source_url: article.source_url,
            source_icon: article.source_icon,
            language: article.language,
            country: article.country || [],
            category: article.category || [],
            likes: 0,
          });

          await doc.save();
          console.log(`✅ Saved: ${article.title} (${article.article_id})`);
        }
      } catch (keywordError) {
        console.error(
          `❌ Error fetching articles for keyword "${keyword}":`,
          keywordError.message
        );

        // If it's a rate limit error affecting all keys, wait before continuing
        if (keywordError.message.includes("All API keys are rate limited")) {
          console.log(
            "⏳ All keys rate limited, waiting 5 minutes before continuing..."
          );
          await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // Wait 5 minutes
        }
      }
    }
  } catch (err) {
    console.error("❌ General fetch error:", err.message);
  } finally {
    console.log("🛑 Fetching completed.");

    // Log API key status
    const status = apiManager.getStatus();
    console.log(
      `📊 API Key Status: ${status.currentKey} | Total Keys: ${status.totalKeys}`
    );
  }
};

// Function to get API key status
const getAPIKeyStatus = () => {
  return apiManager.getStatus();
};

// Function to reset all API keys (useful for debugging)
const resetAPIKeys = () => {
  apiManager.resetAllKeys();
  console.log("🔄 All API keys have been reset");
};

fetchAndStoreNews();

// Export functions for external use
module.exports = {
  fetchAndStoreNews,
  getAPIKeyStatus,
  resetAPIKeys,
  apiManager,
};
