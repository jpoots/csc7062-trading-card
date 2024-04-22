const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/expansions", [auth], async (req, res) => {
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
    } catch {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.get("/types", [auth], async (req, res) => {
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
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', [auth], (req, res) => {
    res.json({
        status: 404,
        message: "endpoint not found",
    })
});

module.exports = router;
