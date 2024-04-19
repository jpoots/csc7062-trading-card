const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const sessions = require("express-session");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const querystring = require('querystring');

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_PORT =  process.env.API_PORT;

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

const formConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
}

// perform a db query, slice and return
const slicedSearch = async (query, params) => {
    const rowSize = 5;

    let cardResult = await db.promise().query(query, params);
    cardResult = cardResult[0];
    let sliced = await slicer(cardResult)
    return sliced;
}

const slicer = async (list) => {
    const rowSize = 5;
    let sliced = [];
    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
    for (let i = 0; i < list.length; i += rowSize) {
        const chunk = list.slice(i, i + rowSize);
        sliced.push(chunk);
    }
    // end of reference
    return sliced;
}


// home page
router.get("/", (req, res) => {
    console.log(API_PORT)
    res.render("index")
});

router.get("/login", (req, res) => {
    res.render("login");
});

// login
router.post("/login", async (req, res) => {
    let credentials = {
        email: req.body.email,
        pass: req.body.pass
    };

    try {
        /* https://axios-http.com/docs/urlencoded */
        credentials = querystring.stringify(credentials);
    
        let authenticateResult = await axios.post(`http://localhost:${API_PORT}/authenticate`, credentials, formConfig);
    
        if (authenticateResult.data.status === 200){
            req.session.userid = authenticateResult.data.response;
            res.redirect("/mycards")
        } else {
            res.render("login", {
                message: authenticateResult.data.message
            });
        }
    } catch (err) {
        res.render("error");
    }
});

// register
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    // TODO: look at how i might improve security here (e.g can I call tolowercase on  undefined?)
    // https://www.npmjs.com/package/bcrypt?activeTab=readme
    const email = req.body.email;
    const display = req.body.displayname
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    let body = {
        email: req.body.email,
        displayname: req.body.displayname,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword
    }

    try{
        body = querystring.stringify(body);

        let registrationResult = await axios.post(`http://localhost:${API_PORT}/register`, body, formConfig);
        
        if(registrationResult.data.status != 200){
            res.render("register", {
                message: registrationResult.data.message
            });
        } else {
            req.session.userid = registrationResult.data.response;
            res.redirect("/mycards");
        }
    } catch (error){
        res.render("error");
    }
});

// logout 
router.get("/logout", (req, res) => {
    req.session.userid = null;
    res.redirect("/");
});

router.get("/account", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login");
    } else {
        try {
            let accountResult = await axios.get(`http://localhost:${API_PORT}/account/${req.session.userid}`);

            if (accountResult.data.status != 200){
                throw new Error("issue with request")
            } else {
                let userData = accountResult.data.response;
    
                res.render("account", {
                    email: userData.email_address,
                    displayName: userData.display_name,
                    avatar: userData.avatar_url
                });
            }
        } catch (error) {
            res.render("error");
        }
    }
});

// browse
router.get("/browse", async (req, res) => {
    try {
        let cardQuery = "";

        if (req.query.search){
            cardQuery = `http://localhost:${API_PORT}/cards?search=${req.query.search}`;
        } else {
            cardQuery = `http://localhost:${API_PORT}/cards`;
        }

        let cardResult = await axios.get(cardQuery);
    
        if (cardResult.data.status !== 200){
            res.render("error");
        } else {
            let cards = cardResult.data.response;
            cards = await slicer(cards);
        
            res.render("browse", {cards: cards});
        }
    } catch (err){
        res.render("error");
    }
});

router.get("/collections", async (req, res) => {
    try {
        let collectionQ = req.query.search ? `http://localhost:${API_PORT}/collections?search=${req.query.search}` : `http://localhost:${API_PORT}/collections`;
    
        let collectionsResult = await axios.get(collectionQ);
    
        if (collectionsResult.data.status !== 200){
            res.render("error");
        } else {
            let collections = collectionsResult.data.response;
            collections = await slicer(collections);
            res.render("collections", {collections: collections});
        }
    } catch (err){
        render("error");
    }
});

router.get("/collections/:collectionid", async (req, res) => {
    let collectionID = req.params.collectionid;
    let owner = false;
    let ownerID = 0;
    let collections = [];
    let currentCollection = "";
    let rated = false;
    let userID = req.session.userid;
    let yourRating = 0;

    let cardQuery = `
    SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM collection_card
    INNER JOIN card
    ON collection_card.card_id = card.card_id
    LEFT JOIN card_like
    ON card_like.card_id = card.card_id
    WHERE collection_card.collection_id = ?
    GROUP BY card.card_id;`;

    let cards = await slicedSearch(cardQuery, [collectionID]);

    let ownerQuery = `SELECT user_id FROM collection
    WHERE collection_id = ?;`

    ownerID = await db.promise().query(ownerQuery, [collectionID]);
    ownerID = ownerID[0];

    if (ownerID.length === 0){
        res.render("error");
    } else {
        ownerID = ownerID[0].user_id;

        if (ownerID === userID){
            owner = true;

            let collQ = 
            `SELECT collection.collection_id, collection_name FROM collection 
            WHERE collection.user_id = ?
            ORDER BY collection_name`;
            
            collections = await db.promise().query(collQ, [ownerID]);
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
            isOwner: owner,
            ownerID: ownerID,
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

        res.redirect("/mycards/collections");
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

    res.redirect("/mycards/collections")
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
    if (!req.session.userid){
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
router.get("/card/:cardid", async (req, res) => {
    // get card id from the req
    let userID = req.session.userid;
    let cardID = req.params.cardid;
    
    let cardQ = "";
    let collections = [];
    try {
        if (userID) {
            let collectionsResult = await axios.get(`http://localhost:${API_PORT}/collections?userid=${userID}`);
            if (collectionsResult.data.status != 200) throw new Error(collections.data.message);
            collections = collectionsResult.data.response;

            cardQ = `http://localhost:${API_PORT}/cards/${cardID}?userid=${userID}`;
        } else {
            cardQ = `http://localhost:${API_PORT}/cards/${cardID}`;
        }
    
        let cardResult = await axios.get(cardQ);
        
        if (cardResult.data.status != 200) throw new Error (cardResult.data.message);

        res.render("card", {
            card : cardResult.data.card,
            collections: collections
        });

    } catch (err){
        res.render("error");
    }

});

router.post("/likecard", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login");
    } else {
        let body = {
            cardid: req.body.cardid,
            userid: req.session.userid
        }

        try {
            body = querystring.stringify(body);

            let likeResult = await axios.post(`http://localhost:${API_PORT}/likecard`, body, formConfig);
            if (likeResult.data.status != 200) throw new Error("error with request");
            
            res.redirect(`/card/${req.body.cardid}`);
        } catch {
            res.render("error");
        }
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
        SELECT send.display_name as "sender", rec.display_name as "recipient", subject, body, DATE_FORMAT(time_sent, '%d/%m/%Y') as "date", TIME_FORMAT(time_sent, '%H:%i:%s') as "time", sender_id, recipient_id, card_id
        FROM message
        INNER JOIN user rec
        ON rec.user_id = message.recipient_id
        INNER JOIN user send
        ON send.user_id = message.sender_id
        WHERE recipient_id = ?
        ORDER BY time_sent DESC;`;

        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];

        res.render("inbox", {messages: messages})
    } else {
        res.redirect("/login");
    }
});

router.get("/sendmessage", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        let recipientID = req.query.recipientid;
        let cardID = req.query.cardid;

        let recipientQ = 
        `SELECT user_id, display_name FROM user
        WHERE user_id = ?
        `

        let cardQ = 
        `SELECT card_id, name FROM card
        WHERE card_id = ?`

        let recipient = await db.promise().query(recipientQ, [recipientID]);
        recipient = recipient[0][0];

        let card = await db.promise().query(cardQ, [cardID]);
        card = card[0][0];

        console.log(recipient)

        res.render("sendmessage", {
            recipient: recipient,
            card: card
        })
    } else {
        res.redirect("/login");
    }
});

router.post("/sendmessage", async (req, res) => {
    let senderID = req.session.userid;
    let recipientID = req.body.recipientid;
    let cardID = req.body.cardid;
    let subject = req.body.subject;
    let body = req.body.body;

    if (senderID){        
        let messageQ = 
        `INSERT INTO message (sender_id, recipient_id, card_id, subject, body)
        VALUES (?, ?, ?, ?, ?);`;
    
        let messageResult = db.promise().query(messageQ, [senderID, recipientID, cardID, subject, body]);

        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error")
});

module.exports = router;
