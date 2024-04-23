const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

// home page
router.get("/", (req, res) => {
    res.render("index")
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error")
});

module.exports = router;
