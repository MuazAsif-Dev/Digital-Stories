const User = require("../models/User");
const Story = require("../models/Story");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc Get a user
// @route GET /users/:username
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Get users from MongoDB
  const users = await User.find({ username }).select("-password").lean().exec();

  // If no users
  if (!users?.length) {
    return res
      .status(400)
      .json({ message: `No user with the username ${username} found` });
  }

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { name, username, password, email, ...userData } = req.body;

  // Confirm data
  if (!name || !username || !password || !email) {
    return res
      .status(400)
      .json({ message: "All required fields are not provided" });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = {
    name,
    username,
    password: hashedPwd,
    email,
    ...userData,
  };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, name, username, password, email, ...userData } = req.body;

  // Confirm data
  if (!id || !name || !username || !email) {
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

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.name = name;
  user.username = username;
  user.email = email;
  user.age = userData.age;
  user.picture = userData.picture;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Update all stories where the user field is equal to the user's _id
  const storyResult = await Story.updateMany(
    { user: id },
    { $set: { user: null } }
  );

  // Update all comments where the user field is equal to the user's _id
  const commentResult = await Story.updateMany(
    { "comments.user": id },
    { $set: { "comments.$.user": null } }
  );

  let storyUpdated = "";

  if (storyResult.modifiedCount > 0) {
    storyUpdated += `and Updated ${storyResult.modifiedCount} posts.`;
  }

  if (commentResult.modifiedCount > 0) {
    storyUpdated += `and ${commentResult.modifiedCount} comments`;
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted ${storyUpdated}`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  getUser,
  createNewUser,
  updateUser,
  deleteUser,
};
