const express = require("express");
const router = express.Router();


const account = require("../routes/users/account");
const userCards = require("../routes/users/cards");
const userCollections = require("../routes/users/collections");
const messaging = require("../routes/users/messaging");



const cards = require("../routes/cards");
const collections = require("../routes/collections")
const misc = require("../routes/misc");

router.use("/users", account);
router.use("/users", userCards);
router.use("/users", userCollections);
router.use("/users", messaging);


router.use("/cards", cards);
router.use("/collections", collections);
router.use("/", misc);

module.exports = router;