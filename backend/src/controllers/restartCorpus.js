const NewsArticle = require('../models/newsArticles');
const { preprocessArticle } = require('./preprocessArticle');

const addLatestCorpus = async (tfidf) => {
    try{
    // add latest 1000 articles to corpus
    // Get the latest 1000 articles from the database
        const latestArticles = await NewsArticle.find().sort({pubDate: -1 }).limit(1000);
        latestArticles.forEach(article => {
            // Preprocess the article content
            const preprocessedContent = article.preprocessedContent ||preprocessArticle(article);
            // Add the preprocessed content to the TF-IDF model
            tfidf.addDocument(preprocessedContent, article._id.toString());
        });
    }catch (error) {
        console.error("Error adding latest corpus:", error);
    }

}

module.exports={addLatestCorpus};