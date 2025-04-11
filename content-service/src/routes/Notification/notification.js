const express = require('express');
const router = express.Router();
const{ createNotifications, getNotification} = require("../../controllers/Notification/notification") 




router.post("/create", createNotifications);
router.get("/", getNotification)


module.exports = router;
