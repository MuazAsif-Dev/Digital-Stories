const Story = require("../models/Story");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// @desc Get all stories
// @route GET /stories
// @access Private
const getAllStories = asyncHandler(async (req, res) => {
  const { id, amount } = req.body;

  let query = {};
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec();

    if (!user) {
      return res.status(400).json({ message: "User ID not found" });
    }

    query = { user: id };
  }

  // Get all stories from MongoDB
  const stories = await Story.find(query)
    .sort({ timeCreated: -1 })
    .limit(amount)
    .lean()
    .exec();

  // If no stories
  if (!stories?.length) {
    return res.status(400).json({ message: "No stories found" });
  }

  res.json(stories);
});

// @desc Create new story
// @route POST /stories
// @access Private
const createNewStory = asyncHandler(async (req, res) => {
  const { content, id } = req.body;

  // Confirm data
  if (!content || !id) {
    return res
      .status(400)
      .json({ message: "All required fields are not provided" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Create and store the new user
  const story = await Story.create({
    user: id,
    content,
  });

  if (story) {
    // Created
    return res.status(201).json({ message: "New story created" });
  } else {
    return res.status(400).json({ message: "Invalid story data received" });
  }
});

// @desc Update a story
// @route PATCH /stories
// @access Private
const updateStory = asyncHandler(async (req, res) => {
  const { storyId, content, comment } = req.body;

  if (!storyId) {
    return res.status(400).json({ message: "Story ID not provided" });
  }

  if (!mongoose.Types.ObjectId.isValid(storyId)) {
    return res.status(400).json({ message: "Invalid Story ID" });
  }

  // Confirm story exists to update
  const story = await Story.findById(storyId).exec();

  if (!story) {
    return res.status(400).json({ message: "Story not found" });
  }

  if (!content && !comment) {
    return res.status(400).json({ message: "No data provided" });
  }

  // Confirm data
  if (content) {
    story.content = content;
  }

  if (comment) {
    if (!comment.user || !comment.content) {
      return res.status(400).json({ message: "Invalid Comment" });
    }
    story.comments.push(comment);
  }

  const updatedStory = await story.save();

  res.json(`User ${updatedStory.user}, story updated successfully`);
});

// @desc Upvote or Downvote a story
// @route PATCH /stories
// @access Private
const voteStory = asyncHandler(async (req, res) => {
  const { id, vote } = req.params;
  const { userId } = req.body;

  // Confirm data
  if (!id || !vote || !userId) {
    return res
      .status(400)
      .json({ message: "All required fields are not provided" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Story ID" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  // Does the user exist
  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Does the story exist
  const story = await Story.findById(id);

  if (!story) {
    return res.status(400).json({ message: "Story not found" });
  }

  if (vote == "upvote") {
    if (story.upvotes.has(userId)) {
      story.upvotes.delete(userId);
    } else {
      story.downvotes.delete(userId);
      story.upvotes.set(userId, true);
    }
  } else if (vote == "downvote") {
    if (story.downvotes.has(userId)) {
      story.downvotes.delete(userId);
    } else {
      story.upvotes.delete(userId);
      story.downvotes.set(userId, true);
    }
  }

  const updatedStory = await Story.findByIdAndUpdate(
    id,
    { upvotes: story.upvotes, downvotes: story.downvotes },
    { new: true }
  );

  res.json(`Story ${updatedStory._id} voted successfully`);
});

// @desc Delete a story
// @route DELETE /stories
// @access Private
const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Story ID required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Story ID" });
  }

  // Confirm story exists to delete
  const story = await Story.findById(id).exec();

  if (!story) {
    return res.status(400).json({ message: "Story not found" });
  }

  const result = await story.deleteOne();

  const reply = `Story with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllStories,
  createNewStory,
  updateStory,
  deleteStory,
  voteStory,
};
