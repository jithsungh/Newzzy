const natural = require('natural');
const {addLatestCorpus} = require("./restartCorpus");
const TfIdf = natural.TfIdf;
let tfidf = new TfIdf();
const processArticle = (preprocessedText,articleId) => {
  // if length < 999 , add latest 1000 articles to corpus
    if (tfidf.documents.length < 1000) {
        tfidf = new TfIdf();
        addLatestCorpus(tfidf);
    }
  // add current article
  tfidf.addDocument(preprocessedText, articleId);
  // Get TF-IDF scores for a specific article
  const docIndex = tfidf.documents.length - 1;

  // Get terms and filter by score > 0.4
  const terms = tfidf.listTerms(docIndex);
  const keywords = terms.filter(term => term.tfidf > 0.4).map(term => term.term);
  return keywords;
}

module.exports = { processArticle, tfidf };

