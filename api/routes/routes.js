const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const bcrypt = require("bcrypt");

// establish db connection
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: '40259713',
    port: '8889',
    multipleStatements: true,
    waitForConnections: true,
    queueLimit: 10
});

db.getConnection((err) => {
    if (err) return console.log(err.message);
    console.log("connected to db using createPool");
});

router.get("/cards", async (req, res) => {
    let cardQ = "";
    let searchName = "";

    if (req.query.search){
        searchName = `${req.query.search}`

        // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card 
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE name 
        LIKE ?
        GROUP BY card.card_id
        ORDER BY
        CASE
        WHEN name LIKE ? THEN 1
        WHEN name LIKE ? THEN 2
        WHEN name LIKE ? THEN 4
        ELSE 3
        END;`;

    } else {
        cardQ = `
        SELECT card.card_id, tcg_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        GROUP BY card.card_id
        ORDER BY name;`;
    }

    try {
        let cards = await db.promise().query(cardQ, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);
        cards = cards[0];

        res.json({
            status: 200,
            message: "success",
            response: cards
        })

    } catch (err) {
        res.json({
            status: 400,
            message: "failure"
        })
    }
});

router.get("/collections", async (req, res) => {
    let collectionQ = "";
    let searchName = "";

    if (req.query.search) {
        searchName = `${req.query.search}`

        // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
        collectionQ = `
        SELECT collection.collection_id, collection_name, display_name, avatar_url 
        FROM collection 
        INNER JOIN user
        ON user.user_id = collection.user_id
        WHERE collection_name
        LIKE ?
        ORDER BY
        CASE
            WHEN collection_name LIKE ? THEN 1
            WHEN collection_name LIKE ? THEN 2
            WHEN collection_name LIKE ? THEN 4
            ELSE 3
        END;`;
    } else {
        collectionQ = `
        SELECT collection.collection_id, collection_name, display_name, avatar_url 
        FROM collection 
        INNER JOIN user
        ON user.user_id = collection.user_id;`;
    }

    try {
        let collections = await db.promise().query(collectionQ, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);
        collections = collections[0];
    
        res.json({
            status: 200,
            message: "success",
            response: collections
        });
    } catch (err) {
        res.json({
            status: 400,
            message: "failure",
        });
    }
});

router.post("/authenticate", async (req, res) => {
    const email = req.body.email;
    const password = req.body.pass;
    const loginQ = `SELECT * FROM user WHERE email_address = ?`;

    let user = await db.promise().query(loginQ, [email]);
    user = user[0];

    if (user.length === 1){
        // https://www.npmjs.com/package/bcrypt?activeTab=readme
        const match = await bcrypt.compare(password, user[0].password_hash);
        if (match) {
            res.json({
                status: 200,
                message: "authenticated",
                response: user.user_id
            });
            return;
        }
    }

    res.json({
        status: 401,
        message: "Issue with username or password"});

});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.json({
        status: 404,
        message: "endpoint not found",
    })
});

module.exports = router;
