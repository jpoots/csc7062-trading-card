const express = require("express");
const router = express.Router();

// home page
router.get("/", (req, res, next) => {
    try {
        res.render("index")
    } catch (err) {
        next(err);
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res, next) => {
    try {
        res.render("error", {
            message: "404 not found"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
