const {
  AdvancedKeywordExtractor,
} = require("./src/controllers/advancedKeywordExtractor");
const { processArticle } = require("./src/controllers/processArticle");
const { preprocessArticle } = require("./src/controllers/preprocessArticle");

// Test the improved keyword extraction
const testKeywordExtraction = () => {
  console.log("🔍 Testing Advanced Keyword Extraction System\n");

  // Sample articles for testing
  const testArticles = [
    {
      title: "Tesla Stock Surges as Electric Vehicle Sales Beat Expectations",
      description:
        "Tesla Inc shares jumped 8% in after-hours trading following the company's announcement that electric vehicle deliveries exceeded analyst expectations for the third quarter. The electric car manufacturer delivered 435,000 vehicles globally, surpassing the consensus estimate of 420,000 units. CEO Elon Musk praised the production team's efforts in achieving this milestone despite ongoing supply chain challenges.",
    },
    {
      title: "Federal Reserve Raises Interest Rates to Combat Inflation",
      description:
        "The Federal Reserve announced a 0.75 percentage point increase in the federal funds rate, bringing it to 3.25%. Fed Chair Jerome Powell stated that the central bank remains committed to fighting inflation, which reached 8.3% year-over-year in August. The decision was unanimous among voting members and marks the fifth rate hike this year.",
    },
    {
      title: "Apple Unveils New iPhone 15 with Advanced Camera Technology",
      description:
        "Apple Inc revealed the iPhone 15 lineup during its annual September event, featuring breakthrough camera improvements and enhanced artificial intelligence capabilities. The technology giant announced significant upgrades to computational photography, including professional-grade video recording and advanced image processing. The smartphone will be available in multiple configurations starting at competitive pricing.",
    },
    {
      title:
        "Climate Change Summit Reaches Historic Agreement on Carbon Emissions",
      description:
        "World leaders at the international climate summit have reached a groundbreaking agreement to reduce global carbon emissions by 50% within the next decade. The comprehensive environmental accord includes renewable energy investments, sustainable development initiatives, and innovative carbon capture technologies. Scientists praise the ambitious targets as crucial for addressing the climate crisis.",
    },
  ];

  const extractor = new AdvancedKeywordExtractor();

  testArticles.forEach((article, index) => {
    console.log(`\n📰 Article ${index + 1}: ${article.title}\n`);

    // Test advanced extraction
    const advancedKeywords = extractor.extractKeywords(article, 8);
    console.log("🎯 Advanced Keywords:", advancedKeywords);

    // Test full processing workflow
    const preprocessed = preprocessArticle(article);
    const processedKeywords = processArticle(
      article,
      preprocessed,
      `test_${index}`
    );
    console.log("⚙️  Full Workflow Keywords:", processedKeywords);

    console.log("━".repeat(80));
  });

  console.log("\n✅ Testing completed!\n");
  console.log("Key improvements for SINGLE WORD extraction:");
  console.log(
    "• Enhanced named entity recognition (single words from entities)"
  );
  console.log(
    "• Advanced part-of-speech analysis (nouns, adjectives prioritized)"
  );
  console.log(
    "• Domain-specific word prioritization (tech, politics, economy, etc.)"
  );
  console.log(
    "• Strict single-word filtering (no phrases or multi-word terms)"
  );
  console.log("• Comprehensive stopword elimination (news jargon removed)");
  console.log(
    "• Smart scoring system (title presence, word length, frequency)"
  );
  console.log("• Quality thresholds to ensure meaningful keywords only");
  console.log("• Optimal 6-8 unique single words per article");
  console.log(
    "\n🎯 Keywords are now single, descriptive words that uniquely identify each article!"
  );
};

// Run the test
testKeywordExtraction();
