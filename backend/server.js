require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/mongo.js");
// const authRoutes = require("./src/routes/auth");
// const newsRoutes = require("./src/routes/api/news");

const app = express();

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());
connectDB()
  .then(() => {
    app.listen(process.env.port, () => {
      console.log(`Server is running on port ${process.env.port}`);
      console.log(`http://localhost:${process.env.port}/`);
      require("./src/controllers/newsfetcher.js");
    });
  })
  .catch((error) => console.log(error));

// Middleware
// app.use(cors());

// app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

// app.use("/api", newsRoutes);

// app.use("/auth", authRoutes);

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
