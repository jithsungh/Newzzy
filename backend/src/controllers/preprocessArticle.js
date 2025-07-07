const sw = require("stopword");

const preprocessArticle = (article) => {
  const description = article.description || "";
  const title = article.title || "";
  const text = description + " " + title;

  // Basic cleaning while preserving some structure
  const cleanedText = text
    // Remove URLs first
    .replace(/https?:\/\/[^\s]+/g, " ")
    // Remove HTML tags
    .replace(/<[^>]*>/g, " ")
    // Remove extra whitespace but keep single spaces
    .replace(/\s+/g, " ")
    .trim();

  // Convert to lowercase for processing
  const lowerText = cleanedText.toLowerCase();

  // Remove special characters but keep apostrophes and hyphens in words
  const normalizedText = lowerText
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Tokenize
  const tokens = normalizedText.split(/\s+/);

  // Enhanced stopword removal with news-specific terms
  const newsStopwords = [
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
    "would",
    "this",
    "they",
    "we",
    "you",
    "your",
    "said",
    "says",
    "according",
    "reported",
    "report",
    "reports",
    "today",
    "yesterday",
    "tomorrow",
    "now",
    "then",
    "here",
    "there",
    "reuters",
    "ap",
    "cnn",
    "bbc",
    "news",
    "breaking",
    "update",
    "updates",
    "told",
    "tells",
    "telling",
    "article",
    "story",
    "read",
    "click",
    "also",
    "just",
    "still",
    "even",
    "only",
    "really",
    "very",
    "quite",
    "get",
    "got",
    "getting",
    "take",
    "took",
    "taking",
    "make",
    "made",
    "making",
  ];

  const filteredTokens = tokens.filter(
    (token) =>
      token.length > 2 && !newsStopwords.includes(token) && !/^\d+$/.test(token) // Remove pure numbers
  );

  // Rejoin tokens
  const preprocessedText = filteredTokens.join(" ");

  return preprocessedText;
};

module.exports = { preprocessArticle };
