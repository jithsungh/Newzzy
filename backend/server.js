require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/mongo.js");
const apiKeyRoutes = require("./src/routes/apiKeys.js");
// const authRoutes = require("./src/routes/auth");
// const newsRoutes = require("./src/routes/api/news");

const app = express();

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log(`http://localhost:${process.env.PORT}/`);
      require("./src/controllers/newsfetcher.js");
    });
  })
  .catch((error) => console.log(error));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/keys", apiKeyRoutes);
// app.use("/api", newsRoutes);
// app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send(`server running on port....${process.env.PORT}`);
});

app.get("/run-news-fetcher", async (req, res) => {
  try {
    await fetchAndStoreNews();
    res.status(200).send("✅ News fetched successfully");
  } catch (error) {
    console.error("❌ Error in manual news fetch:", error.message);
    res.status(500).send("❌ News fetch failed");
  }
});

// app.use("/*", (req, res) => {
//   res.status(404).json({
//     message: "Route not found",
//   });
// })

// const { processAllArticles } = require("./src/controllers/processAllArticles.js")
// processAllArticles()
//   .then(() => {
//     console.log("All articles processed successfully.");
//   })
//   .catch((error) => {
//     console.error("Error processing articles:", error);
//   });
