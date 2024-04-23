const express = require("express");
const router = express.Router();

// home page
router.get("/", (req, res) => {
    res.render("index")
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error", {
        message: "404 not found"
    });
});

module.exports = router;
