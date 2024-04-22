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
const API_ADD = process.env.API_ADDRESS;

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
            throw new Error(collectionsResult.data.message);
        } else {
            let collections = collectionsResult.data.response;
            collections = await slicer(collections);
            res.render("collections", {collections: collections});
        }
    } catch (err){
        res.render("error");
    }
});

router.get("/collections/:collid", async (req, res) => {
    try {
        let collection = await axios.get(API_ADD + `/collections/${req.params.collid}?userid=${req.session.userid}`);
        collection = collection.data.response;
        collection.cards = await slicer(collection.cards);
    
        let collections = await axios.get(API_ADD + `/collections?userid=${req.session.userid}`);
        collections = collections.data.response;
    
        res.render("collection", {
            cards: collection.cards,
            collection: collection,
            collections: collections
        });
    } catch (error) {
        res.render("error");
    }
});

router.post("/createcoll", async (req, res) => {
    let userID = req.session.userid;

    if (userID) {
        let body = {
            userid: userID,
            collname: req.body.collname
        };

        try {
            body = querystring.stringify(body);
            let createResult = await axios.post(`http://localhost:${API_PORT}/createcoll`, body, formConfig);
            if (createResult.data.status !== 200) throw new Error(createResult.data.message);
            res.redirect("/mycards/collections");
        } catch (error){
            res.render("error");
        }
    } else {
        res.redirect("/login");
    }
});

router.post("/deletecoll", async (req, res) => {
    if (req.session.userid) {
        let body = {
            collid: req.body.collid
        };
        
        try {
            body = querystring.stringify(body);

            let deleteResult = await axios.post(API_ADD + `/deletecoll`, body, formConfig)
            if (deleteResult.data.status != 200) throw new Error(deleteResult.data.message);

            res.redirect("/mycards/collections")
        } catch (error) {
            res.render("error");
        }

    } else {
        res.redirect("/login");
    }
});


router.post("/addremovecard", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        let body = {
            userid: userID,
            cardid: req.body.cardid,
            collid: req.body.collid,
            action: req.body.action
        }

        try {
            body = querystring.stringify(body);
            let addResult = await axios.post(`http://localhost:${API_PORT}/addremovecard`, body, formConfig);

            if (addResult.data.status === 409) {
                res.redirect(`/card/${req.body.cardid}?error=duplicate`);
                return;
            } else if (addResult.data.status != 200){
                throw new Error(addResult.data.message);
            }
        
            res.redirect(`/collections/${req.body.collid}`)
        } catch (error) {
            res.render("error")
        }

    } else {
        res.redirect("/login")
    }

});


router.get("/expansions/:expansionid", async (req, res) => {
    let expansionID = req.params.expansionid;

    try {
        let cards = await axios.get(`http://localhost:${API_PORT}/cards?expansionid=${expansionID}`);
        if (cards.data.status != 200) throw new Error(cards.data.message);

        cards = await slicer(cards.data.response);
        res.render("browse", {cards: cards});
    } catch (error) {
        res.render("error");
    }
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
    if (!req.session.userid){
        res.redirect("/login")
    } else {
        let userID = req.session.userid;
        
        try {
            // get collections to populate drop down
            let collections = await axios.get(`http://localhost:${API_PORT}/collections?userid=${userID}`);
            if (collections.data.status != 200) throw new Error(collections.data.message);

            collections = collections.data.response;
            let currentCollection = collections[0];
            if (!currentCollection){
                res.render("mycollections");
            } else {
                res.redirect(`/collections/${currentCollection.collection_id}`);
            }
        } catch (error){
            res.render("error");
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
        try {
            let cards = await axios.get(`http://localhost:${API_PORT}/cards?likedby=${userID}`);
            if (cards.data.status != 200) throw new Error(cards.data.message);

            cards = cards.data.response;
            cards = await slicer(cards);

            res.render("browse", {cards: cards})
        } catch (error) {
            res.render("error");
        }
    } else {
        res.redirect("/login");
    }
});

// card
router.get("/card/:cardid", async (req, res) => {
    // get card id from the req
    let userID = req.session.userid;
    let cardID = req.params.cardid;
    let error = req.query.error;
    
    let collections = [];
    try {
        if (userID) {
            let collectionsResult = await axios.get(`http://localhost:${API_PORT}/collections?userid=${userID}`);
            if (collectionsResult.data.status != 200) throw new Error(collections.data.message);
            collections = collectionsResult.data.response;
        }
    
        let cardResult = await axios.get(API_ADD + `/cards/${cardID}?userid=${userID}`);
        
        if (cardResult.data.status != 200) throw new Error (cardResult.data.message);

        res.render("card", {
            card : cardResult.data.response,
            collections: collections,
            error: error
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
            if (likeResult.data.status != 200) throw new Error(likeResult.data.message);
            
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
        let body = {
            collid: req.body.collid,
            userid: userID,
            rating: req.body.rating
        }

        try {
            body = querystring.stringify(body);
            let rateResult = await axios.post(`http://localhost:${API_PORT}/ratecollection`, body, formConfig);
            res.redirect(`/collections/${req.body.collid}`);
        } catch {
            res.render("error");
        }
    }
});

router.post("/commentcollection", async (req, res) => {
    let userID = req.session.userid;

    if (!userID) {
        res.redirect("/login");
    } else {
        let body = {
            userid: userID,
            collid: req.body.collid,
            comment: req.body.comment
        };
        
        try {
            body = querystring.stringify(body);
            let commentResult = await axios.post(`http://localhost:${API_PORT}/commentcollection`, body, formConfig);
            if (commentResult.data.status != 200) throw new Error(commentResult.data.message);

            res.redirect(`/collections/${req.body.collid}`);
        } catch (error){
            res.render("error");
        }
    }
});

router.get("/expansions", async (req, res) => {

    try {
        let expansions = await axios.get(`http://localhost:${API_PORT}/expansions`);
        if (expansions.data.status != 200) throw new Error(expansions.data.message);

        expansions = expansions.data.response;
        expansions = await slicer(expansions);
        res.render("expansions", {expansions: expansions});
    } catch {
        res.render("error");
    }

});

router.get("/filter", async (req, res) => {
    try {
    // https://stackoverflow.com/questions/5223/length-of-a-javascript-object */https://stackoverflow.com/questions/5223/length-of-a-javascript-objects
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (Object.keys(req.query).length > 0) {
        let cardsResult = await axios.get(API_ADD + "/cards", {
            params: req.query
        });

        if (cardsResult.data.status != 200) throw new Error(cardsResult.data.message);

        let cards = await slicer(cardsResult.data.response);

        res.render("browse", {cards: cards});
    } else {

        let expansions = await axios.get(API_ADD + "/expansions");
        expansions = expansions.data.response;

        let types = await axios.get(API_ADD + "/types");
        types = types.data.response;

        /* http://localhost:3000/filter?filterby=hp&param=10 */        
        res.render("filter", {
        expansions: expansions,
        types: types
        });
    }
    } catch (error) {
        res.render("error");
    }
});

router.get("/messages", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let messages = await axios.get(`http://localhost:${API_PORT}/messages/${userID}`);
            messages = messages.data.response;
    
            res.render("inbox", {messages: messages}); 
        } catch (error) {
            res.render("error");
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/sendmessage", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let recipient = await axios.get(`http://localhost:${API_PORT}/user/${req.query.recipientid}`);
            if (recipient.data.status != 200) throw new Error(response.data.message);
            recipient = recipient.data.response;

            let card = await axios.get(`http://localhost:${API_PORT}/cards/${req.query.cardid}`);
            if (card.data.status != 200) throw new Error(card.data.message);
            card = card.data.response;
            
            res.render("sendmessage", {
                recipient: recipient,
                card: card
            })
        } catch (error) {
            res.render("error");
        }

    } else {
        res.redirect("/login");
    }
});

router.post("/sendmessage", async (req, res) => {
    let senderID = req.session.userid;

    if (senderID){        
        let body = {
            senderid: senderID,
            recipientid: req.body.recipientid,
            cardid: req.body.cardid,
            subject: req.body.subject,
            body: req.body.body
        };

        try {
            body = querystring.stringify(body);
            let messageResult = await axios.post(`http://localhost:${API_PORT}/sendmessage`, body, formConfig);
            if (messageResult.data.status !== 200) throw new Error(messageResult.data.message);
            res.redirect("/");
        } catch (error) {
            res.render("error");
        }

    } else {
        res.redirect("/login");
    }
});

/* https://www.geeksforgeeks.org/how-to-redirect-404-errors-to-a-page-in-express-js/ */
router.all('*', (req, res) => {
    res.render("error")
});

module.exports = router;
