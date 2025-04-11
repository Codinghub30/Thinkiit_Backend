const express = require("express");
const router = express.Router();
const videoController = require("../../controllers/batch/videoController");

router.post("/", videoController.createVideo);
router.get("/", videoController.getVideos);
router.get("/:classId", videoController.getVideosByClass);
router.get("/subject/:subjectName", videoController.getVideosBysubjectName);
router.put("/:id", videoController.updateVideo);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
