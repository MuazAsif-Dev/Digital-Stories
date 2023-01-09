const express = require("express");
const router = express.Router();
const storiesController = require("../controllers/storiesController");

router
  .route("/")
  .get(storiesController.getAllStories)
  .post(storiesController.createNewStory)
  .patch(storiesController.updateStory)
  .delete(storiesController.deleteStory);

router.route("/:id/:vote").patch(storiesController.voteStory);

module.exports = router;
