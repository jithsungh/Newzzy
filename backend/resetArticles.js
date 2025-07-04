const mongoose = require("mongoose");
const NewsArticle = require("./src/models/newsArticles.js");

const resetArticles = async () => {
  try {
    const articles = await NewsArticle.find({});

    const updatedArticles = articles.map((article) => {
      const newDoc = article.toObject();
      newDoc.article_id = article._id.toString(); // store original _id as article_id
      delete newDoc._id; // remove _id to allow Mongo to generate a new one
      return newDoc;
    });

    // Remove all old documents
    await NewsArticle.deleteMany({});

    // Insert new documents with new ObjectId
    await NewsArticle.insertMany(updatedArticles);

    console.log("All articles have been updated with new _id and article_id.");
  } catch (error) {
    console.error("Error resetting articles:", error);
  }
};
resetArticles();
