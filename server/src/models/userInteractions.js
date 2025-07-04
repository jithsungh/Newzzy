const mongoose = require("mongoose");
const userInteractionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsArticle",
      required: true,
    },

    action: {
      type: String,
      enum: ["like", "dislike", "share", "save"],
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

userInteractionSchema.index(
  { user_id: 1, article_id: 1, action: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserInteraction", userInteractionSchema);
