const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");

router.get("/expansions", async (req, res) => {
    let expansionQ = `
    SELECT * FROM expansion
    ORDER BY expansion_name`;

    try {
        let expansions = await db.promise().query(expansionQ);
        expansions = expansions[0];
    
        res.json({
            status: 200,
            message: "succcess",
            response: expansions
        });
    } catch (err) {
        util.errorHandler(err, res)
    }
});

router.get("/types", async (req, res) => {
    let allTypeQ = 
    `SELECT type_id, type_name FROM type
    ORDER BY type_name;`;

    try {
        let types = await db.promise().query(allTypeQ);
        types = types[0];
    
        res.json({
            status: 200,
            message: "success",
            response: types
        });
    } catch (error) {
        util.errorHandler(err, res)
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    let err = createError.NotFound();

    res.json({
        status: err.status,
        message: err.message,
    })
});

module.exports = router;
