const natural = require("natural");
const nlp = require("compromise");

class AdvancedKeywordExtractor {
  constructor() {
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();

    // Enhanced stopwords including news-specific terms
    this.stopWords = new Set([
      ...natural.stopwords,
      "said",
      "says",
      "according",
      "reported",
      "news",
      "today",
      "yesterday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
      "year",
      "years",
      "time",
      "people",
      "made",
      "make",
      "way",
      "also",
      "first",
      "last",
      "week",
      "weeks",
      "day",
      "days",
      "month",
      "months",
      "reuters",
      "ap",
      "associated",
      "press",
      "told",
      "tells",
      "telling",
      "report",
      "reports",
      "article",
      "story",
      "news",
      // Additional news jargon
      "breaking",
      "update",
      "updates",
      "latest",
      "live",
      "coverage",
      "developing",
      "sources",
      "source",
      "official",
      "officials",
      "statement",
      "announced",
      "confirm",
      "confirmed",
      "according",
      "spokesperson",
      "representative",
      // Common verbs that don't add meaning
      "will",
      "would",
      "could",
      "should",
      "might",
      "may",
      "can",
      "must",
      "have",
      "has",
      "had",
      "been",
      "being",
      "are",
      "were",
      "was",
      "is",
      "get",
      "got",
      "getting",
      "take",
      "took",
      "taking",
      "give",
      "gave",
      "giving",
      "come",
      "came",
      "coming",
      "go",
      "went",
      "going",
      "see",
      "saw",
      "seeing",
      "know",
      "knew",
      "knowing",
      "think",
      "thought",
      "thinking",
      "say",
      "saying",
      // Generic adjectives
      "new",
      "old",
      "good",
      "bad",
      "big",
      "small",
      "large",
      "great",
      "high",
      "low",
      "long",
      "short",
      "early",
      "late",
      "recent",
      "current",
      "major",
      "minor",
      "important",
      "significant",
      "key",
      "main",
      "top",
      "best",
      "worst",
      "better",
      // Generic nouns
      "thing",
      "things",
      "part",
      "parts",
      "place",
      "places",
      "area",
      "areas",
      "group",
      "groups",
      "number",
      "numbers",
      "amount",
      "amounts",
      "level",
      "levels",
    ]);

    // Technical/domain-specific words that should be prioritized
    this.priorityWords = new Set([
      "technology",
      "innovation",
      "artificial",
      "intelligence",
      "machine",
      "learning",
      "blockchain",
      "cryptocurrency",
      "bitcoin",
      "ethereum",
      "digital",
      "cyber",
      "climate",
      "environment",
      "renewable",
      "energy",
      "sustainability",
      "carbon",
      "election",
      "democracy",
      "government",
      "politics",
      "policy",
      "legislation",
      "economy",
      "economic",
      "financial",
      "market",
      "investment",
      "inflation",
      "health",
      "medical",
      "vaccine",
      "treatment",
      "disease",
      "research",
      "education",
      "university",
      "student",
      "academic",
      "science",
      "scientific",
    ]);
  }

  // Extract single meaningful words with enhanced scoring
  extractSingleWords(text, title = "") {
    const doc = nlp(text);
    const words = new Map(); // word -> score

    // Get all meaningful words with their grammatical information
    const terms = doc.terms().data();

    terms.forEach((term) => {
      // Safely extract the word
      const word = (term.clean || term.text || "").toLowerCase().trim();

      // Skip if it's a stopword, too short, too long, or non-alphabetic
      if (
        !word ||
        this.stopWords.has(word) ||
        word.length < 4 ||
        word.length > 15 ||
        !/^[a-zA-Z]+$/.test(word)
      ) {
        return;
      }

      let score = 1;

      // Boost score based on part of speech
      if (term.pos) {
        if (term.pos.includes("Noun")) {
          score += 3; // Nouns are very important
        }
        if (term.pos.includes("Adjective")) {
          score += 2; // Descriptive adjectives
        }
        if (term.pos.includes("Verb")) {
          score += 1; // Action words (but lower priority)
        }
      }

      // Boost priority words
      if (this.priorityWords.has(word)) {
        score += 5;
      }

      // Boost if word appears in title
      if (title.toLowerCase().includes(word)) {
        score += 4;
      }

      // Boost capitalized words (likely proper nouns)
      if (term.text && /^[A-Z]/.test(term.text)) {
        score += 2;
      }

      // Boost longer meaningful words
      if (word.length >= 7) {
        score += 1;
      }

      // Update score (accumulate if word appears multiple times)
      words.set(word, (words.get(word) || 0) + score);
    });

    return words;
  }

  // Calculate TF-IDF-like score for word importance
  calculateWordImportance(
    word,
    wordFreq,
    totalWords,
    titleText,
    descriptionText
  ) {
    let score = 0;

    // Base frequency score (normalized)
    const tf = wordFreq / totalWords;
    score += tf * 10;

    // Title presence bonus
    if (titleText.toLowerCase().includes(word)) {
      score += 8;
    }

    // Position in text (earlier = more important)
    const firstIndex = descriptionText.toLowerCase().indexOf(word);
    if (firstIndex !== -1) {
      const positionScore = 1 - firstIndex / descriptionText.length;
      score += positionScore * 3;
    }

    // Word length sweet spot (6-12 characters are usually most meaningful)
    if (word.length >= 6 && word.length <= 12) {
      score += 2;
    } else if (word.length < 5) {
      score *= 0.7; // Penalize very short words
    }

    // Frequency bonus (but not too much to avoid common words)
    if (wordFreq > 1 && wordFreq <= 3) {
      score += 1; // Moderate repetition is good
    } else if (wordFreq > 3) {
      score *= 0.8; // Too much repetition might be noise
    }

    // Priority word bonus
    if (this.priorityWords.has(word)) {
      score += 5;
    }

    return score;
  }

  // Enhanced entity extraction for single words
  extractNamedEntityWords(text) {
    const doc = nlp(text);
    const entityWords = new Set();

    // Extract individual words from entities
    const extractWordsFromEntity = (entity) => {
      const words = entity.text().toLowerCase().split(/\s+/);
      words.forEach((word) => {
        word = word.replace(/[^a-z]/g, ""); // Clean punctuation
        if (
          word.length >= 4 &&
          word.length <= 15 &&
          !this.stopWords.has(word)
        ) {
          entityWords.add(word);
        }
      });
    };

    // Extract from different entity types
    doc.people().forEach(extractWordsFromEntity);
    doc.places().forEach(extractWordsFromEntity);
    doc.organizations().forEach(extractWordsFromEntity);
    doc.topics().forEach(extractWordsFromEntity);

    return Array.from(entityWords);
  }

  // Main extraction method for single words only
  extractKeywords(article, maxKeywords = 8) {
    const title = article.title || "";
    const description = article.description || "";
    const combinedText = `${title} ${description}`;

    if (combinedText.trim().length < 20) {
      return [];
    }

    // Extract single words with scoring
    const wordScores = this.extractSingleWords(combinedText, title);

    // Extract entity words
    const entityWords = this.extractNamedEntityWords(combinedText);

    // Boost entity words
    entityWords.forEach((word) => {
      if (wordScores.has(word)) {
        wordScores.set(word, wordScores.get(word) + 3);
      } else {
        wordScores.set(word, 3);
      }
    });

    // Calculate final importance scores
    const totalWords = Array.from(wordScores.values()).reduce(
      (sum, freq) => sum + freq,
      0
    );
    const finalScores = [];

    for (const [word, freq] of wordScores.entries()) {
      const importance = this.calculateWordImportance(
        word,
        freq,
        totalWords,
        title,
        description
      );

      finalScores.push({ word, score: importance, frequency: freq });
    }

    // Sort by score and return top words
    const topWords = finalScores
      .filter((item) => item.score > 1.0) // Minimum quality threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords)
      .map((item) => item.word);

    // Ensure we have some keywords - fallback to highest frequency words
    if (topWords.length < 3) {
      const frequentWords = Array.from(wordScores.entries())
        .filter(
          ([word, freq]) =>
            freq > 1 && word.length >= 5 && !this.stopWords.has(word)
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

      topWords.push(
        ...frequentWords.filter((word) => !topWords.includes(word))
      );
    }

    return topWords.slice(0, maxKeywords);
  }
}

module.exports = { AdvancedKeywordExtractor };
