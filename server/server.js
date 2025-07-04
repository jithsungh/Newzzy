require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/mongo.js");
const recommendationsRoutes = require("./src/routes/recommendations.js");
const authRoutes = require("./src/routes/authRoutes.js"); // const newsRoutes = require("./src/routes/api/news");
const profileRoutes = require("./src/routes/profileRoutes.js");
const userInteractionRoutes = require("./src/routes/userInteractionRoutes.js");
const articleRoutes = require("./src/routes/articleRoutes.js");

const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());
connectDB()
  .then(() => {
    app.listen(process.env.port, () => {
      console.log(`Server is running on port ${process.env.port}`);
      console.log(`http://localhost:${process.env.port}/`);
    });
  })
  .catch((error) => console.log(error));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// app.use("/api", newsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/userinteractions", userInteractionRoutes);
app.use("/api/articles", articleRoutes);

app.get("/", (req, res) => {
  res.send("server running on port....");
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
