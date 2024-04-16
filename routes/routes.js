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
            res.redirect("/")
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
    let read = "SELECT card_id, name, image_url FROM card";
    
    let cards = await slicedSearch(read);
    res.render("browse", {cards: cards});
});

router.post("/browse", async (req, res) => {
    let searchName = `${req.body.search}`
    
    // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
    let read = `SELECT card_id, name, image_url FROM card 
                WHERE name 
                LIKE ?
                ORDER BY
                CASE
                    WHEN name LIKE ? THEN 1
                    WHEN name LIKE ? THEN 2
                    WHEN name LIKE ? THEN 4
                    ELSE 3
                END`;

    let cards = await slicedSearch(read, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);

    res.render("browse", {cards: cards});
});

router.get("/collections", async (req, res) => {
    let searchName = `${req.body.search}`

    let read = `SELECT collection.collection_id, collection_name, display_name, avatar_url FROM collection 
    INNER JOIN user
    ON user.user_id = collection.user_id;`;

    let collections = await slicedSearch(read, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);
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
    
    let cardQuery = `SELECT * FROM collection_card
    INNER JOIN card
    ON collection_card.card_id = card.card_id
    WHERE collection_card.collection_id = ?;`;
    let cards = await slicedSearch(cardQuery, [collectionID]);

    let ownerQuery = `SELECT user_id FROM collection
    WHERE collection_id = ?;`

    let ownerId = await db.promise().query(ownerQuery, [collectionID]);
    ownerId = ownerId[0][0].user_id;

    if (ownerId === req.session.userid){
        owner = true;

        let collQ = 
        `SELECT collection.collection_id, collection_name FROM collection 
        WHERE collection.user_id = ?
        ORDER BY collection_name`;
        
        collections = await db.promise().query(collQ, [ownerId]);
        collections = collections[0]

        let collection = `
        SELECT * FROM collection
        WHERE collection_id = ?
        `;
    
        currentCollection = await db.promise().query(collection, [collectionID])
        currentCollection = currentCollection[0][0];
    }

    res.render("collection", {
        cards: cards,
        owner: owner,
        collections: collections,
        currentCollection : currentCollection
    });

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
    let read = `SELECT card_id, name, image_url FROM card
                INNER JOIN expansion
                ON expansion.expansion_id = card.expansion_id
                WHERE card.expansion_id = ?;`;
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
        let likedCardsQ = `
        SELECT card.card_id, name, image_url FROM card_like
        INNER JOIN card 
        ON card.card_id = card_like.card_id
        WHERE user_id = ?`
    
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
    let read = `SELECT * FROM card WHERE card_id = ?`;
    let collections = [];
    let liked = false;
    let userID = req.session.userid;

    if (userID){
        let collectionQuery = `
        SELECT * FROM collection
        WHERE user_id = ?;
        `

        collections = await db.promise().query(collectionQuery, [userID]);
        collections = collections[0];

        let likeQ = `
        SELECT * FROM card_like
        WHERE card_id = ?
        AND user_id = ?
        `;

        let likeResult = await db.promise().query(likeQ, [cardID, userID]);
        likeResult = likeResult[0]

        if(likeResult.length > 0) {
            liked = true;
        }

    }

    let likeQuery = `
    SELECT COUNT(*) FROM card_like
    WHERE card_id = ?`;

    let likeCount = await db.promise().query(likeQuery, [cardID]);
    likeCount = likeCount[0][0]["COUNT(*)"];


    // get card data from 
    db.query(read, [cardID], async (err, result) => {
        // error checking
        if(err) throw err;
        if (result.length === 0) return res.redirect("/browse");

        // format card data and get price data
        let card = result[0]
        let response = await pokemon.card.find(card.tcg_id);

        // to fixed from https://www.tutorialspoint.com/How-to-format-a-number-with-two-decimals-in-JavaScript
        let price = response.cardmarket.prices.trendPrice.toFixed(2);
        let priceURL = response.cardmarket.url

        // prepare card data for rendering
        cardData = {
            name: card.name,
            cardId: card.card_id,
            likeCount: likeCount,
            liked: liked,
            set: "a set",
            expansion: "an expansion",
            category: "Pokemon",
            evolves: "evolves",
            stage: "Basic",
            hp: card.hp,
            illustrator: "Me",
            image: card.image_url,
            type: ["https://static.tcgcollector.com/content/images/90/d7/49/90d74923dfb481342fb5cb6c78e5fc6f6a8992cbd72a127d78af726c412a1bdc.png"],
            attack:[
                {
                    name: "Absorb",
                    effect: "Heal 10 damage from this Pokémon.",
                    damage: 10
                }
            ],
            price: price,
            priceURL: priceURL
        }

        res.render("card", {
            card : cardData,
            collections: collections
        });
    });
});

router.post("/like", async (req, res) => {
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

        let likeResult = db.promise().query(likeQ, [cardID, userID])
        res.redirect(`/card/${cardID}`)
    }
});

router.get("/expansions", async (req, res) => {
    let query = "SELECT * FROM expansion"
    let expansions = await slicedSearch(query)
    res.render("expansions", {expansions: expansions});
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error")
});

module.exports = router;
