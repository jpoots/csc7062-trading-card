const express = require("express");
const router = express.Router();


const account = require("../routes/account")
const card = require("../routes/card");
const collection = require("../routes/collection")
const messaging = require("../routes/messaging");
const misc = require("../routes/misc");

router.use("/", account);
router.use("/", card);
router.use("/", collection);
router.use("/", messaging);
router.use("/", misc);

module.exports = router;