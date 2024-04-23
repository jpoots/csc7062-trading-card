const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const querystring = require('querystring');
const slicer = require("../utility");

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

//https://blog.logrocket.com/using-axios-set-request-headers/

router.get("/collections", async (req, res) => {
    try {
        let collectionQ = req.query.search ? `${API_ADD}/collections?search=${req.query.search}` : `${API_ADD}/collections`;

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
            let addResult = await axios.post(`${API_ADD}/addremovecard`, body);

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

module.exports = router;
