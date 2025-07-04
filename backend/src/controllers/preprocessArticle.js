const sw = require("stopword");
const preprocessArticle = (article) => {
  const description = article.description || "";
  const title = article.title || "";
  const text = description + title;

  // to lowercase
  const lowerText = text.toLowerCase();

  // remove special characters and symbols
  const cleanedText = lowerText
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // remove HTML, urls
  const urlRegex = /https?:\/\/[^\s]+/g;
  const htmlRegex = /<[^>]*>/g;
  const cleanedTextWithoutUrls = cleanedText
    .replace(urlRegex, " ")
    .replace(htmlRegex, " ")
    .trim();

  //tokenize
  const tokens = cleanedTextWithoutUrls.split(" ");

  // remove stop words
  const filteredTokens = sw.removeStopwords(tokens, sw.en);

  // rejoin tokens
  const preprocessedText = filteredTokens.join(" ");

  return preprocessedText;
};

module.exports = { preprocessArticle };
