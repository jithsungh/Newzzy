const axios = require("axios");
const mongoose = require("mongoose");
const cron = require("node-cron");

const NewsArticle = require("../models/newsArticles.js");
const { preprocessArticle } = require("./preprocessArticle");
const { processArticle } = require("./processArticle");

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
      const response = await axios.get("https://newsdata.io/api/1/latest", {
        params: {
          apikey: process.env.NEWS_API_KEY2,
          q: keyword,
          language: "en",
        },
      });

      const articles = response.data.results;

      for (const article of articles) {
        if (!article.article_id || !article.title || !article.description || !article.image_url)
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
        console.log(
          "------------------------------->" +
            article.title +
            article.description +
            "\n----------------->" +
            preprocessedContent
        );
        //process
        const processedKeywords = processArticle(
          preprocessedContent,
          article.article_id
        );
        console.log(`Keywords for: ${article.title}`);
        console.log(processedKeywords);

        // save article
        const allKeywords = [
          ...processedKeywords,
          ...(article.keywords || []),
          ...(article.category || []),
        ];
        let uniqueKeywords = [];
        for (const kw of allKeywords) {
          if (
            kw &&
            !uniqueKeywords.includes(kw.toLowerCase()) &&
            kw.length > 2
          ) {
            uniqueKeywords.push(kw.toLowerCase());
          }
        }
        article.keywords = uniqueKeywords;

        const doc = new NewsArticle({
          article_id: article.article_id,
          title: article.title,
          link: article.link,
          preprocessedContent: preprocessedContent,
          keywords: uniqueKeywords || [keyword],
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
    }
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
  } finally {
    console.log("🛑 Fetching completed.");
  }
};

// Schedule every 20 minutes
// You can adjust the cron expression as needed
cron.schedule("*/2 * * * *", () => {
  console.log("🕒 Fetching news based on user interests...");
  fetchAndStoreNews();
});

// Run once at startup
fetchAndStoreNews();
