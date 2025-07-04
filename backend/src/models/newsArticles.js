const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema(
  {
    article_id: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    preprocessedContent: String,
    keywords: [String],
    creator: [String],
    description: {
      type: String,
    },
    // content: {
    //     type: String
    // },
    pubDate: {
      type: Date,
      required: true,
    },
    image_url: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    source_id: String,
    source_name: String,
    source_url: String,
    source_icon: String,
    language: String,
    country: [String],
    category: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
