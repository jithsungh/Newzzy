const natural = require("natural");
const { AdvancedKeywordExtractor } = require("./advancedKeywordExtractor");
const { addLatestCorpus } = require("./restartCorpus");

const TfIdf = natural.TfIdf;
let tfidf = new TfIdf();
const keywordExtractor = new AdvancedKeywordExtractor();

const processArticle = (article, preprocessedText, articleId) => {
  // Use advanced keyword extraction as primary method
  const advancedKeywords = keywordExtractor.extractKeywords(article, 8);

  // Filter to ensure only single words (no spaces or phrases)
  const singleWords = advancedKeywords.filter(
    (keyword) =>
      keyword &&
      typeof keyword === "string" &&
      !keyword.includes(" ") &&
      keyword.length >= 4 &&
      keyword.length <= 15 &&
      /^[a-zA-Z]+$/.test(keyword) // Only alphabetic characters
  );

  // If we have good single words from advanced extraction, use them
  if (singleWords.length >= 3) {
    return singleWords;
  }

  // Fallback to TF-IDF for very short articles or when advanced extraction fails
  if (tfidf.documents.length < 1000) {
    tfidf = new TfIdf();
    addLatestCorpus(tfidf);
  }

  // Add current article
  tfidf.addDocument(preprocessedText, articleId);

  // Get TF-IDF scores for the current article
  const docIndex = tfidf.documents.length - 1;
  const terms = tfidf.listTerms(docIndex);

  // More selective TF-IDF filtering - only single words
  const tfidfKeywords = terms
    .filter(
      (term) =>
        term.tfidf > 0.3 &&
        term.term.length >= 4 &&
        term.term.length <= 15 &&
        !term.term.includes(" ") && // Ensure single words only
        !isCommonWord(term.term) &&
        /^[a-zA-Z]+$/.test(term.term) // Only alphabetic characters
    )
    .sort((a, b) => b.tfidf - a.tfidf)
    .slice(0, 6)
    .map((term) => term.term);

  // Combine and deduplicate, ensuring all are single words
  const combinedKeywords = [
    ...new Set([...singleWords, ...tfidfKeywords]),
  ].filter((keyword) => keyword && !keyword.includes(" "));

  return combinedKeywords.slice(0, 8);
};

// Helper function to filter out common words that TF-IDF might miss
const isCommonWord = (word) => {
  const commonWords = [
    "said",
    "says",
    "will",
    "can",
    "may",
    "might",
    "could",
    "would",
    "should",
    "new",
    "old",
    "good",
    "bad",
    "big",
    "small",
    "high",
    "low",
    "long",
    "short",
    "many",
    "much",
    "some",
    "all",
    "any",
    "more",
    "most",
    "less",
    "few",
    "several",
    "other",
    "another",
    "same",
    "different",
    "various",
    "certain",
    "sure",
    "real",
    "right",
    "wrong",
    "true",
    "false",
    "best",
    "better",
    "worse",
    "worst",
  ];
  return commonWords.includes(word.toLowerCase());
};

module.exports = { processArticle, tfidf };
