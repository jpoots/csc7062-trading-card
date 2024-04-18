const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const sessions = require("express-session");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript
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

// define global row size
const rowSize = 5;
const saltRounds = 5;

// perform a db query, slice and return
const slicedSearch = async (query, params) => {
    let cardResult = await db.promise().query(query, params);
    cardResult = cardResult[0];
    let sliced = [];
    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
    for (let i = 0; i < cardResult.length; i += rowSize) {
        const chunk = cardResult.slice(i, i + rowSize);
        sliced.push(chunk);
    }
    // end of reference
    return sliced;
}


// home page
router.get("/", (req, res) => {
    res.render("index")
});

router.get("/login", (req, res) => {
    res.render("login");
});

// login
router.post("/login", async (req, res) => {
    // https://www.npmjs.com/package/bcrypt?activeTab=readme
    let email = req.body.email;
    let password = req.body.pass;
    let read = `SELECT * FROM user WHERE email_address = ?`;

    let user = await db.promise().query(read, [email]);
    user = user[0];

    if (user.length === 1){
        const match = await bcrypt.compare(password, user[0].password_hash);
        if (match) {
            req.session.auth = true;
            req.session.userid = user[0].user_id;
            res.redirect("/mycards")
        } else {
            res.render("login", {
                message: "Issue with username or password"
            });
        }

    } else {
        res.render("login", {
            message: "Issue with usernme or password"
        });
    }
});

// register
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    // TODO: look at how i might improve security here (e.g can I call tolowercase on  undefined?)
        // https://www.npmjs.com/package/bcrypt?activeTab=readme
        const email = req.body.email.trim().toLowerCase();
        const display = req.body.displayname.trim();
        const password = req.body.password;
        const confirmPassword = req.body.confirmpassword;
        const avatarURL = `https://ui-avatars.com/api/?name=${display}`

        let message = "";

        if (!display || !email || !password || !confirmPassword || display.length === 0 || email.length === 0 || password.trim().length === 0 || confirmPassword.trim().length === 0){
            message = "Please enter all fields";
            res.render("register", {
                message
            });
        } else if (!email.includes("@")){
            message = "Invalid email";
            res.render("register", {
                message
            });
        } else if (password !== confirmPassword){
            message = "Passwords do not match";
            res.render("register", {
                message
            });
        } else {
            let emailSearch = `SELECT * FROM user WHERE email_address = ?`;
            let displaySearch = `SELECT * FROM user WHERE display_name = ?`;
            let insert = `INSERT INTO user (email_address, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)`;
        
            let emailUser = await db.promise().query(emailSearch, [email]);
            emailUser = emailUser[0];

            let displayUser = await db.promise().query(displaySearch, [display]);
            displayUser = displayUser[0];
        
            if (emailUser.length != 0){
                message = "Email already in use";
                res.render("register", {
                    message
                });
            } else if (displayUser.length != 0) {
                message = "Display name already in use";
                res.render("register", {
                    message
                });
            } else {
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    let insertResult = await db.promise().query(insert, [email, hash, display, avatarURL]);
                    req.session.auth = true;
                    req.session.userid = insertResult[0].insertId;
                    res.redirect("/");            
                });
            }
        }
});

// logout 
router.get("/logout", (req, res) => {
    req.session.auth = false; 
    res.redirect("/");
});

router.get("/account", async (req, res) => {

    if (!req.session.auth){
        res.redirect("/");
    } else {
        const read = "SELECT * FROM user WHERE user_id = ?";
        let userData = await db.promise().query(read, [req.session.userid]);

        userData = userData[0][0];
        
        res.render("account", {
            email: userData["email_address"],
            displayName: userData["display_name"],
            avatar: userData["avatar_url"]
        });
    }
});

// browse
router.get("/browse", async (req, res) => {
    let read = `
    SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
    FROM card
    LEFT JOIN card_like
    ON card_like.card_id = card.card_id
    GROUP BY card.card_id
    ORDER BY name;`;
    
    let cards = await slicedSearch(read);
    res.render("browse", {cards: cards});
});

router.post("/browse", async (req, res) => {
    let searchName = `${req.body.search}`

    // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
    let read = `SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card 
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
                END
                `;

    let cards = await slicedSearch(read, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);

    res.render("browse", {cards: cards});
});

router.get("/collections", async (req, res) => {
    let searchName = `${req.body.search}`

    let read = `SELECT collection.collection_id, collection_name, display_name, avatar_url FROM collection 
    INNER JOIN user
    ON user.user_id = collection.user_id;`;

    let collections = await slicedSearch(read);
    res.render("collections", {collections: collections});
});

router.post("/collections", async (req, res) => {
    let searchName = `${req.body.search}`

    // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
    let read = `SELECT collection.collection_id, collection_name, display_name, avatar_url FROM collection 
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
                END`;
    
    let collections = await slicedSearch(read, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);
    res.render("collections", {collections: collections});

});

router.get("/collections/:collectionId", async (req, res) => {
    let collectionID = req.params.collectionId;
    let owner = false;
    let collections = [];
    let currentCollection = "";
    let rated = false;
    let userID = req.session.userid;
    let yourRating = 0;
    
    let cardQuery = `SELECT * FROM collection_card
    INNER JOIN card
    ON collection_card.card_id = card.card_id
    WHERE collection_card.collection_id = ?;`;
    let cards = await slicedSearch(cardQuery, [collectionID]);

    let ownerQuery = `SELECT user_id FROM collection
    WHERE collection_id = ?;`

    let ownerId = await db.promise().query(ownerQuery, [collectionID]);
    ownerId = ownerId[0];

    if (ownerId.length === 0){
        res.render("error");
    } else {
        ownerId = ownerId[0].user_id;

        if (ownerId === userID){
            owner = true;

            let collQ = 
            `SELECT collection.collection_id, collection_name FROM collection 
            WHERE collection.user_id = ?
            ORDER BY collection_name`;
            
            collections = await db.promise().query(collQ, [ownerId]);
            collections = collections[0]
        } else if (userID) {
            let ratedQ = `
            SELECT COUNT(*) as "count" FROM collection_rating
            WHERE collection_id = ?
            AND user_id = ?;
            `;

            let ratedResult = await db.promise().query(ratedQ, [collectionID, userID]);

            if (ratedResult[0][0].count !== 0) {
                rated = true;
            }
        }

        let collection = `
        SELECT * FROM collection
        WHERE collection_id = ?
        `;

        currentCollection = await db.promise().query(collection, [collectionID])
        currentCollection = currentCollection[0][0];

        let ratingQ = `
        SELECT AVG(rating) FROM collection_rating
        WHERE collection_id = ?;
        `;

        let ratingResult = await db.promise().query(ratingQ, [collectionID]);
        ratingResult = ratingResult[0][0]["AVG(rating)"];

        if (!ratingResult){
            ratingResult = "Unrated";
        } else {
            /*https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript*/
            ratingResult = Math.round(ratingResult * 10) / 10;
        }

        let youRatedQ = `
        SELECT rating FROM collection_rating
        WHERE user_id = ?
        AND collection_id = ?;`;

        let youRatedResults = await db.promise().query(youRatedQ, [userID, collectionID]);

        if (youRatedResults[0].length > 0) {
            rated = true;
            yourRating = youRatedResults[0][0].rating;
        }

        let commentQ = `
        SELECT comment_text, display_name, DATE_FORMAT(time_posted, '%d/%m/%Y') as "date", TIME_FORMAT(time_posted, '%H:%i:%s') as "time"
        FROM collection_comment
        INNER JOIN user
        ON collection_comment.user_id = user.user_id
        WHERE collection_id = ?
        ORDER BY time_posted DESC;`;
    
        let comments = await db.promise().query(commentQ, [collectionID]);
        comments = comments[0];

        res.render("collection", {
            cards: cards,
            owner: owner,
            collections: collections,
            currentCollection : currentCollection,
            rated: rated,
            rating: ratingResult,
            comments: comments,
            rated: rated,
            yourRating: yourRating
        });
    }

});

router.post("/createcol", async (req, res) => {
    let user_id = req.session.userid;

    if (user_id) {
        let colName = `${req.body.colName}`;

        let insertQuery = `INSERT INTO collection (collection_name, user_id) 
        VALUES (?, ?);`

        let insertResult = await db.promise().query(insertQuery, [colName, user_id]);

        res.redirect("/mycards");
    } else {
        res.redirect("/login");
    }
});

router.post("/deletecol", async (req, res) => {
    let collID = req.body.collid;

    let collectionQ = `
    SELECT * FROM collection
    WHERE collection_id = ?;`;


    let deleteCollQ = `
    DELETE FROM collection
    WHERE collection_id = ?;
    `;

    let collectionResult = await db.promise().query(collectionQ, [collID]);
    collectionResult = collectionResult[0][0];

    let deleteResult = await db.promise().query(deleteCollQ, [collID]);

    if (collectionResult.collection_name === "Liked Cards") {
        let unlikeQ = `
        DELETE FROM `
    }

    res.redirect("/mycards")
});

router.post("/removecard", async (req, res) => {
    let cardID = req.body.cardId;
    let collID = req.body.collId;
    let userID = req.session.userid;

    let removeQ = `
    DELETE FROM collection_card
    WHERE collection_id = ?
    AND card_id = ?;
    `;

    let removeResult = await db.promise().query(removeQ, [collID, cardID]);

    res.redirect(`/collections/${collID}`);
})

router.post("/addcard", async (req, res) => {
    let userID = req.session.userid;
    let cardID = req.body.cardid;
    let collID = req.body.collid;

    let addQ = `
    INSERT INTO collection_card (collection_id, card_id)
    VALUES (?, ?);
    `

    let addResult = await db.promise().query(addQ, [collID, cardID]);

    res.redirect(`/collections/${collID}`)
});


router.get("/browse/:expansionId", async (req, res) => {
    let expansionID = req.params.expansionId;
    let read = `SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card
                LEFT JOIN card_like
                ON card_like.card_id = card.card_id
                INNER JOIN expansion
                ON expansion.expansion_id = card.expansion_id
                WHERE card.expansion_id = ?
                GROUP BY card.card_id
                ORDER BY name;`;
    let cards = await slicedSearch(read, [expansionID]);
    res.render("browse", {cards: cards});
});

// mycards
router.get("/mycards", (req, res) => {
    if (!req.session.auth){
        res.redirect("/login")
    } else {
        res.render("mycards")
    }
});

router.get("/mycards/collections", async (req, res) => {
    if (!req.session.auth){
        res.redirect("/login")
    } else {
        let user_id = req.session.userid;
    
        // get collections to populate drop down
        let collQ = 
        `SELECT collection.collection_id, collection_name FROM collection 
        WHERE collection.user_id = ${user_id}
        ORDER BY collection_name`;

        let collections = await db.promise().query(collQ);
        collections = collections[0]

        let currentCollection = collections[0];
        
        if (!currentCollection){
            res.render("mycollections");
        } else {
            res.redirect(`/collections/${currentCollection.collection_id}`);
        }
    }
});

router.post("/mycards/collections", async (req, res) => {
    let collectionID = req.body.collid;
    res.redirect(`/collections/${collectionID}`);
});

router.get("/mycards/liked", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        let likedCardsQ = 
        `
        SELECT card_like.card_id, name, image_url, COUNT(card_like.card_like_id) as "like_count" FROM card_like
        INNER JOIN card 
        ON card.card_id = card_like.card_id
        WHERE user_id = ?
        GROUP BY card.card_id
        ORDER BY name;`
    
        let cards = await slicedSearch(likedCardsQ, [userID]);
        res.render("browse", {cards: cards})
    } else {
        res.redirect("login");
    }
});

// card
router.get("/card/:cardId", async (req, res) => {

    // get card id from the req
    let cardID = req.params.cardId;
    let collections = [];
    let liked = false;
    let userID = req.session.userid;
    let evolveFrom = "N/A"

    if (userID) {
        let collectionQuery = `
        SELECT * FROM collection
        WHERE user_id = ?;
        `;

        collections = await db.promise().query(collectionQuery, [userID]);
        collections = collections[0];

        let likeStatusQ = `
        SELECT * FROM card_like
        WHERE card_id = ?
        AND user_id = ?
        `;

        let likeResult = await db.promise().query(likeStatusQ, [cardID, userID]);
        likeResult = likeResult[0]

        if(likeResult.length > 0) {
            liked = true;
        }
    }

    let likeCountQ = `
    SELECT COUNT(*) as "count" FROM card_like
    WHERE card_id = ?`;

    let likeCount = await db.promise().query(likeCountQ, [cardID]);
    likeCount = likeCount[0][0].count;

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
    WHERE card.card_id = ?;
    `;

    let card = await db.promise().query(cardQ, [cardID])
    card = card[0][0];

    if (card.evolve_from) {
        evolveFrom = card.evolve_from
    }

    let attackQ = `
    SELECT attack_name, effect, damage FROM attack
    INNER JOIN attack_card
    ON attack_card.attack_id = attack.attack_id
    INNER JOIN card
    ON card.card_id = attack_card.card_id
    WHERE card.card_id = ?;
    `
    let attacks = await db.promise().query(attackQ, [cardID]);
    attacks = attacks[0];

    let typeQ = `
    SELECT type_image
    FROM type
    INNER JOIN type_card
    ON type.type_id = type_card.type_id
    WHERE card_id = ?;`

    let types = await db.promise().query(typeQ, [cardID]);
    types = types[0];

    let priceResponse = await pokemon.card.find(card.tcg_id);
    let price = priceResponse.cardmarket.prices.trendPrice.toFixed(2);
    let priceURL = priceResponse.cardmarket.url
    
    // prepare card data for rendering
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

    res.render("card", {
        card : cardData,
        collections: collections
    });
});

router.post("/likecard", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login");
    } else {
        let cardID = req.body.cardid;
        let userID = req.session.userid;
        let likeStatus = req.body.likestatus;
        let likeQ = "";

        if (likeStatus === "Like") {
            likeQ = `
            INSERT INTO card_like (card_id, user_id)
            VALUES (?, ?)
            `;

        } else {
            likeQ = `
            DELETE FROM card_like
            WHERE card_id = ?
            AND user_id = ?;
            `
        }

        let likeResult = await db.promise().query(likeQ, [cardID, userID])
        res.redirect(`/card/${cardID}`)
    }
});

router.post("/ratecollection", async (req, res) => {
    let userID = req.session.userid;

    if (!userID) {
        res.redirect("/login")
    } else {
        let collID = req.body.collid;
        let rating = req.body.rating;
        let rateStatus = req.body.ratestatus;
        let rateQ = "";

        if (rateStatus === "Rate") {
            rateQ = `
            INSERT INTO collection_rating (user_id, collection_id, rating)
            VALUES (?, ?, ?)`;
        } else {
            rateQ = `
            DELETE FROM collection_rating
            WHERE user_id = ?
            AND collection_id = ?;`;
        }
        
        let rateResult = await db.promise().query(rateQ, [userID, collID, rating]);
        res.redirect(`/collections/${collID}`);
    }
});

router.post("/commentcollection", async (req, res) => {
    let userID = req.session.userid;

    if (!userID) {
        res.redirect("/login");
    } else {
        let collID = req.body.collid;
        let comment = req.body.comment;

        let commentQ = `
        INSERT INTO collection_comment (comment_text, collection_id, user_id)
        VALUES (?, ?, ?)`

        let commentResult = await db.promise().query(commentQ, [comment, collID, userID]);

        res.redirect(`/collections/${collID}`);
    }
});

router.get("/expansions", async (req, res) => {
    let query = "SELECT * FROM expansion"
    let expansions = await slicedSearch(query)
    res.render("expansions", {expansions: expansions});
});

router.get("/filter", async (req, res) => {
    let query = req.query;
    console.log(query)

    if (req.query.expid) {
        let expID = req.query.expid;

        let expansionQ = 
        `SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE expansion_id = ?
        GROUP BY card.card_id
        ORDER BY name;`

        let cards = await slicedSearch(expansionQ, [expID])

        res.render("browse", {cards: cards})

        console.log(expID);
    } else if (req.query.minlikes) {
        let minLikes = req.query.minlikes;

        /* https://stackoverflow.com/questions/6095567/sql-query-to-obtain-value-that-occurs-more-than-once */
        let minLikesQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        GROUP BY card.card_id
        HAVING COUNT(card_like_id) >= ?
        ORDER BY COUNT(card_like_id)
        `

        let cards = await slicedSearch(minLikesQ, [minLikes])

        res.render("browse", {cards: cards})
    
    } else if (req.query.maxhp && req.query.minhp) {
        let maxHP = req.query.maxhp;
        let minHP = req.query.minhp;  

        let hpQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp`;

        let cards = await slicedSearch(hpQ, [minHP, maxHP]);

        res.render("browse", {cards: cards})

    } else if (req.params.typeid) {
        let typeID = req.params.typeid;

        let typeQ = 
        `SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp `

    } else {
        let allExpansionQ = 
        `SELECT expansion_name, expansion_id FROM expansion
        ORDER BY expansion_name;`;

        let allTypeQ = 
        `SELECT type_id, type_name FROM type;`;
    
        let expansions = await db.promise().query(allExpansionQ);
        expansions = expansions[0];

        let types = await db.promise().query(allTypeQ);
        types = types[0];


            /* http://localhost:3000/filter?filterby=hp&param=10 */        
        res.render("filter", {
        expansions: expansions,
        types: types
        });
    } 
});

router.get("/messages", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        let messageQ = `
        SELECT send.display_name as "sender", rec.display_name as "receiver", message_body, DATE_FORMAT(time_sent, '%d/%m/%Y') as "date", TIME_FORMAT(time_sent, '%H:%i:%s') as "time"
        FROM message
        INNER JOIN user rec
        ON rec.user_id = message.receiver_id
        INNER JOIN user send
        ON send.user_id = message.sender_id
        WHERE receiver_id = ?
        ORDER BY time_sent DESC;`;

        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];

        res.render("inbox", {messages: messages})
    } else {
        res.redirect("/login");
    }
});

router.get("/sendmessage/:recipientid", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        let recipientID = req.params.recipientid;

        let recipientQ = 
        `SELECT user_id, display_name FROM user
        WHERE user_id = ?
        `

        let recipient = await db.promise().query(recipientQ, [recipientID]);
        recipient = recipient[0][0];

        res.render("sendmessage", {recipient: recipient})
    } else {
        res.redirect("/login");
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error")
});

module.exports = router;
