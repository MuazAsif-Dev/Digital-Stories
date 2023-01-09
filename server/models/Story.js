const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  upvotes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  downvotes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  timeCreated: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      edited: {
        type: Boolean,
        default: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Story", storySchema);
