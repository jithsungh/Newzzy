const mongoose = require('mongoose');

const NewsArticle = require('../models/newsArticles.js');
const Recommendation = require('../models/recommendations.js');

const getLatestNewsArticles = async (n=1000) => {
  //fetch latest news articles from the database
  // get the latest n news articles
  try {
    const latestNewsArticles = await NewsArticle.find({})
      .sort({ pubDate: -1 })
      .limit(n)
      .hint({ pubDate: -1 }) // Use the index on pubDate for performance
      .exec();
    
    return latestNewsArticles;
  } catch (error) {
    console.error('Error fetching latest news articles:', error);
    throw error;
  }
}

module.exports = getLatestNewsArticles;