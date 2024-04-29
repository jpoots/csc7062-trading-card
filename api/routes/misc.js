const express = require("express");
const router = express.Router();
const db = require("../serverfuncs/db");
const createError = require("http-errors");

router.get("/expansions", async (req, res, next) => {
    let expansionQ;
    let params = [];

    if (req.query.search){
        searchName = `${req.query.search}`;

        // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
        expansionQ = `
        SELECT * FROM expansion
        WHERE expansion_name 
        LIKE ?
        ORDER BY
        CASE
        WHEN expansion_name LIKE ? THEN 1
        WHEN expansion_name LIKE ? THEN 2
        WHEN expansion_name LIKE ? THEN 4
        ELSE 3
        END;`;
        params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];
    } else {
        expansionQ = `
        SELECT * FROM expansion
        ORDER BY expansion_name`;
    }

    try {
        let expansions = await db.promise().query(expansionQ, params);
        expansions = expansions[0];
    
        res.json({
            status: 200,
            message: "succcess",
            response: expansions
        });
    } catch (err) {
        next(err);
    }
});

router.get("/types", async (req, res, next) => {
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
    } catch (err) {
        next(err);
    }
});

router.get("/illustrators", async (req, res, next) => {
    let allIllQ = 
    `SELECT * FROM illustrator
    ORDER BY illustrator_name;`;

    try {
        let illustrators = await db.promise().query(allIllQ);
        illustrators = illustrators[0];
    
        res.json({
            status: 200,
            message: "success",
            response: illustrators
        });
    } catch (err) {
        next(err);
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
