const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const bcrypt = require("bcrypt");
const validator = require("email-validator"); // https://www.npmjs.com/package/email-validator
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript

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

router.get("/cards/:cardid", async (req, res) => {
    let cardID = req.params.cardid;
    let userID = req.query.userid;

    let liked = false;
    let evolveFrom = "N/A";

    let cardQ = `
    SELECT name, card.card_id, hp, card.tcg_id, category_name, stage_name, illustrator_name, image_url, expansion_name, evolve_from
    FROM card 
    INNER JOIN illustrator
    ON illustrator.illustrator_id = card.illustrator_id
    INNER JOIN expansion
    ON expansion.expansion_id = card.expansion_id
    INNER JOIN category
    ON category.category_id = card.category_id
    INNER JOIN stage
    ON stage.stage_id = card.stage_id
    WHERE card.card_id = ?;`;

    let attackQ = `
    SELECT attack_name, effect, damage FROM attack
    INNER JOIN attack_card
    ON attack_card.attack_id = attack.attack_id
    INNER JOIN card
    ON card.card_id = attack_card.card_id
    WHERE card.card_id = ?;
    `
    let typeQ = `
    SELECT type_image
    FROM type
    INNER JOIN type_card
    ON type.type_id = type_card.type_id
    WHERE card_id = ?;`

    let likeCountQ = `
    SELECT COUNT(*) as "like_count" FROM card_like
    WHERE card_id = ?`;

    let likeStatusQ = `
    SELECT * FROM card_like
    WHERE card_id = ?
    AND user_id = ?
    `;

    try {
        let card = await db.promise().query(cardQ, [cardID])
        card = card[0][0];
    
        let likeCount = await db.promise().query(likeCountQ, [cardID]);
        likeCount = likeCount[0][0].like_count;
    
        let attacks = await db.promise().query(attackQ, [cardID]);
        attacks = attacks[0];
    
        let types = await db.promise().query(typeQ, [cardID]);
        types = types[0];

        let priceResponse = await pokemon.card.find(card.tcg_id);
        let price = priceResponse.cardmarket.prices.trendPrice.toFixed(2);
        let priceURL = priceResponse.cardmarket.url
    
        if (card.evolve_from) evolveFrom = card.evolve_from;
    
        if (req.query.userid){
            let likeResult = await db.promise().query(likeStatusQ, [cardID, userID]);
            likeResult = likeResult[0]
    
            if(likeResult.length > 0) liked = true;
        }
    
        cardData = {
            name: card.name,
            cardId: card.card_id,
            likeCount: likeCount,
            liked: liked,
            expansion: card.expansion_name,
            category: card.category_name,
            evolveFrom: evolveFrom,
            stage: card.stage_name,
            hp: card.hp,
            illustrator: card.illustrator_name,
            image: card.image_url,
            types: types,
            attacks: attacks,
            price: price,
            priceURL: priceURL
        }
    
        res.json({
            status: 200,
            message: "success",
            card: cardData
        })
    } catch (error) {
        res.json({
            status: 400,
            message: "failure",
        });
    }

});

router.get("/collections", async (req, res) => {
    let collectionQ = "";
    let searchName = "";
    let params = [];

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
        params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];
    } if (req.query.userid) {
        collectionQ = `
        SELECT * FROM collection
        WHERE user_id = ?;`;
        params = req.query.userid;
    } else {
        collectionQ = `
        SELECT collection.collection_id, collection_name, display_name, avatar_url 
        FROM collection 
        INNER JOIN user
        ON user.user_id = collection.user_id;`;
    }

    try {
        let collections = await db.promise().query(collectionQ, params);
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

    try {
        let user = await db.promise().query(loginQ, [email]);
        user = user[0];
    
        if (user.length === 1){
            // https://www.npmjs.com/package/bcrypt?activeTab=readme
            const match = await bcrypt.compare(password, user[0].password_hash);
            if (match) {
                res.json({
                    status: 200,
                    message: "authenticated",
                    response: user[0].user_id
                });
                return;
            }
        }

        res.json({
            status: 401,
            message: "Issue with username or password"
        });

    } catch (err) {
        res.json({
            status: 400,
            message: "Issue logging in"
        });
    }
});

router.post("/register", async (req, res) => {
    const saltRounds = 5;

    let email = req.body.email;
    let display = req.body.displayname;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    const avatarURL = `https://ui-avatars.com/api/?name=${display}`;

    let message = "";

    try {
        if (!display || !email || !password || !confirmPassword || display.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0 || confirmPassword.trim().length === 0){
            message = "Enter all fields";
        } else if (!validator.validate(email)){
            message = "Invalid email";
        } else if (password !== confirmPassword){
            message = "Passwords do not match";
        } else {
            display = display.trim();
            email = email.trim();
    
            let emailSearch = `SELECT * FROM user WHERE email_address = ?`;
            let displaySearch = `SELECT * FROM user WHERE display_name = ?`;
    
            let insert = `INSERT INTO user (email_address, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)`;
        
            let emailUser = await db.promise().query(emailSearch, [email]);
            emailUser = emailUser[0];
    
            let displayUser = await db.promise().query(displaySearch, [display]);
            displayUser = displayUser[0];
        
            if (emailUser.length != 0){
                message = "Email in use";
            } else if (displayUser.length != 0) {
                message = "Display name in use";
            } else {
                let hash = await bcrypt.hash(password, saltRounds);
                let insertResult = await db.promise().query(insert, [email, hash, display, avatarURL]);
    
                res.json({
                    status: 200,
                    message: "registered successfully",
                    response: insertResult[0].insertId
                });
                return;
            }
        }
    } catch (error) {
        message = "error processing request";
    } finally {
        res.json({
            status: 400,
            message: message
        });
    }

});

router.get("/account/:userid", async (req, res) => {
    let userID = req.params.userid;

    const accountQ = "SELECT * FROM user WHERE user_id = ?";

    try {
        let userData = await db.promise().query(accountQ, [userID]);
        if (userData[0].length === 1){
            userData = userData[0][0];
            res.json({
                status: 200,
                message: "success",
                response: userData
            });
        } else {
            res.json({
                status: 200,
                message: "account not found",
            });
        }
    } catch (error) {
        res.json({
            status: 400,
            message: "error processing request",
        }); 
    }
});

router.post("/likecard", async (req, res) => {
    let cardID = req.body.cardid;
    let userID = req.body.userid;

    let likeStatus = false;
    let likeStatusQ = 
    `
    SELECT * FROM card_like
    WHERE card_id = ?
    AND user_id = ?
    `
    try {
        let likeStatusResult = await db.promise().query(likeStatusQ, [cardID, userID]);
        likeStatusResult = likeStatusResult[0];
        if (likeStatusResult.length === 1) likeStatus = true;
    
        let likeQ = !likeStatus ? "INSERT INTO card_like (card_id, user_id) VALUES (?, ?)" : "DELETE FROM card_like WHERE card_id = ? AND user_id = ?;" ;
        let likeResult = await db.promise().query(likeQ, [cardID, userID])

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.post("/ratecollection", (req, res) => {
    
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.json({
        status: 404,
        message: "endpoint not found",
    })
});


module.exports = router;
