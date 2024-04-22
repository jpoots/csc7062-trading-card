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
    let params = [];

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
        params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];

    } else if (req.query.likedby){
        userID = req.query.likedby;
        cardQ =
        `SELECT card_like.card_id, name, image_url, COUNT(card_like.card_like_id) as "like_count" FROM card_like
        INNER JOIN card 
        ON card.card_id = card_like.card_id
        WHERE user_id = ?
        GROUP BY card.card_id
        ORDER BY name;`;
        params = [userID];
    } else if (req.query.expansionid){
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        INNER JOIN expansion
        ON expansion.expansion_id = card.expansion_id
        WHERE card.expansion_id = ?
        GROUP BY card.card_id
        ORDER BY name;`;
        params = [req.query.expansionid]
    } else if (req.query.minlikes){
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        GROUP BY card.card_id
        HAVING COUNT(card_like_id) >= ?
        ORDER BY COUNT(card_like_id)
        `
        params = [req.query.minlikes]
    } else if (req.query.maxhp && req.query.minhp) {
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp`;

        params = [req.query.minhp, req.query.maxhp]
    } else if (req.params.typeid) {
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp `
        params = [req.params.typeid];
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
        let cards = await db.promise().query(cardQ, params);
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
            cardID: card.card_id,
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
            response: cardData
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

router.get("/collections/:collid", async (req, res) => {
    let collectionID = req.params.collid;
    let userID = req.query.userid;
    let isOwner = false;
    let rated = false;
    let yourRating = null;
    let ownerID = null;
    let rating = "Unrated"
    let name = "";
    let id = null;
    
    let cardQuery = `
    SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM collection_card
    INNER JOIN card
    ON collection_card.card_id = card.card_id
    LEFT JOIN card_like
    ON card_like.card_id = card.card_id
    WHERE collection_card.collection_id = ?
    GROUP BY card.card_id;`;

    let ownerQuery = `SELECT * FROM collection
    WHERE collection_id = ?;`

    let ratedQ = `
    SELECT * FROM collection_rating
    WHERE collection_id = ?
    AND user_id = ?;
    `;

    let ratingQ = `
    SELECT AVG(rating) FROM collection_rating
    WHERE collection_id = ?;
    `;

    let commentQ = `
    SELECT comment_text, display_name, DATE_FORMAT(time_posted, '%d/%m/%Y') as "date", TIME_FORMAT(time_posted, '%H:%i:%s') as "time"
    FROM collection_comment
    INNER JOIN user
    ON collection_comment.user_id = user.user_id
    WHERE collection_id = ?
    ORDER BY time_posted DESC;`;

    let youRatedQ = `
    SELECT rating FROM collection_rating
    WHERE user_id = ?
    AND collection_id = ?;`;

    try {
        let cards = await db.promise().query(cardQuery, [collectionID]);
        cards = cards[0];
    
        let collection = await db.promise().query(ownerQuery, [collectionID]);
        ownerID = collection[0][0].user_id;
        name = collection[0][0].collection_name;
        id = collection[0][0].collection_id;
    
        if (!ownerID) {
            throw new Error("corrupt collection record");
        }
    
        if (userID === ownerID) isOwner = true;
    
        let ratedResult = await db.promise().query(ratedQ, [collectionID, userID]);
        if (ratedResult[0].length != 0) rated = true;
    
        let comments = await db.promise().query(commentQ, [collectionID]);
        comments = comments[0];
    
        let youRatedResults = await db.promise().query(youRatedQ, [userID, collectionID]);
    
        if (youRatedResults[0].length > 0) {
            rated = true;
            yourRating = youRatedResults[0][0].rating;
        }
    
        let ratingResult = await db.promise().query(ratingQ, [collectionID]);
        ratingResult = ratingResult[0][0]["AVG(rating)"];
    
        /*https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript*/
        if (ratingResult) ratingResult = Math.round(ratingResult * 10) / 10;
    
        let response = {
            id: id,
            name: name, 
            cards: cards,
            isOwner:isOwner,
            ownerID: ownerID,
            rated: rated,
            rating: rating,
            yourRating: yourRating,
            comments: comments,
            yourRating: yourRating
        }
    
        res.json({
            status: 200,
            message: "success",
            response: response
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    };

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

router.post("/ratecollection", async (req, res) => {
    let userID = req.body.userid;
    let collID = req.body.collid;
    let rating = req.body.rating;

    let ratingStatus = false;
    let ratingStatusQ = `
    SELECT * FROM collection_rating
    WHERE user_id = ?
    AND collection_id = ?
    `

    try {
        if ((rating >  4 || rating < 1) && rating) throw new Error("invalid rating");

        let ratingStatusResult = await db.promise().query(ratingStatusQ, [userID, collID]);
        if (ratingStatusResult[0].length === 1) ratingStatus = true;
    
        let rateQ = ratingStatus ? "DELETE FROM collection_rating WHERE user_id = ? AND collection_id = ?;" : "INSERT INTO collection_rating (user_id, collection_id, rating) VALUES (?, ?, ?)";
        let ratingResult = await db.promise().query(rateQ, [userID, collID, rating]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.post("/commentcollection", async (req, res) => {
    let collID = req.body.collid;
    let comment = req.body.comment;
    let userID = req.body.userid;

    let commentQ = `
    INSERT INTO collection_comment (comment_text, collection_id, user_id)
    VALUES (?, ?, ?);`;

    try {
        let commentResult = await db.promise().query(commentQ, [comment, collID, userID]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

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
    } catch {
        res.json({
            status: 400,
            message: "failure"
        });
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
        res.json({
            status: 400,
            message: "failure"
        });
    }

});

router.post("/addremovecard", async (req, res) => {
    let cardID = req.body.cardid;
    let collID = req.body.collid;
    let action = req.body.action;

    let inCollection = false;
    let cardStatusQ = `
    SELECT * FROM collection_card
    WHERE card_id = ?
    AND collection_id = ?
    `;
    try {
        let cardStatusResult = await db.promise().query(cardStatusQ, [cardID, collID]);
        if (cardStatusResult[0].length > 0) inCollection = true;
    
        let query = action == 1 ? "DELETE FROM collection_card WHERE collection_id = ? AND card_id = ?;" : "INSERT INTO collection_card (collection_id, card_id) VALUES (?, ?);"
        if (action == 0 && inCollection) throw new Error("duplicate")
    
        let queryResult = await db.promise().query(query, [collID, cardID]);
        res.json({
        status: 200,
        message: "success"
        });
    } catch (error) {
        if (error.message === "duplicate"){
            res.json({
                status: 409,
                message: "duplicate"
            });
        } else {            
            res.json({
            status: 400,
            message: "failure"
            });
        }
    }
});

router.get("/user/:userid", async (req, res) => {
    let userID = req.params.userid;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;
    let status = 200;
    let message = "success";

    try {
        let userResult = await db.promise().query(userQ, [userID]);

        if (userResult[0].length === 0){
            status = 404;
            message = "user not found"
        } 

        userResult = userResult[0][0];
        res.json({
            status: status,
            message: message,
            response: userResult
        });

    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.post("/sendmessage", async (req, res) => {
    let senderID = req.body.senderid;
    let recipientID = req.body.recipientid;
    let cardID = req.body.cardid;
    let subject = req.body.subject;
    let body = req.body.body;

    let messageQ = `
    INSERT INTO message (sender_id, recipient_id, card_id, subject, body)
    VALUES (?, ?, ?, ?, ?);`;

    try {
        let messageResult = await db.promise().query(messageQ, [senderID, recipientID, cardID, subject, body]);
        res.json({
            status: 200,
            message: "success",
        });
    } catch (error){
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.get("/messages/:userid", async (req, res) => {
    let userID = req.params.userid;

    let messageQ = `
    SELECT send.display_name as "sender", rec.display_name as "recipient", subject, body, DATE_FORMAT(time_sent, '%d/%m/%Y') as "date", TIME_FORMAT(time_sent, '%H:%i:%s') as "time", sender_id, recipient_id, card_id
    FROM message
    INNER JOIN user rec
    ON rec.user_id = message.recipient_id
    INNER JOIN user send
    ON send.user_id = message.sender_id
    WHERE recipient_id = ?
    ORDER BY time_sent DESC;`;
    try {
        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];
    
        res.json({
            status: 200,
            message: "success",
            response: messages
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.post("/createcoll", async (req, res) => {
    let userID = req.body.userid;
    let collName = req.body.collname;

    let insertQuery = `INSERT INTO collection (collection_name, user_id) 
    VALUES (?, ?);`

    try {
        let insertResult = await db.promise().query(insertQuery, [collName, userID]);
        res.json({
            status: 200,
            message: "success"
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
})

router.post("/deletecoll", async (req, res) => {
    let collID = req.body.collid;

    let deleteCollQ = `
    DELETE FROM collection
    WHERE collection_id = ?;
    `;

    try{
        let deleteResult = await db.promise().query(deleteCollQ, [collID]);

        res.json({
            status: 200,
            message: "success",
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});


/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.json({
        status: 404,
        message: "endpoint not found",
    })
});


module.exports = router;
