const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../serverfuncs/utility");
const auth = require("../middleware/auth");

// get all collections
router.get("/collections", async (req, res, next) => {
    try {
        let collectionQ = req.query.search ? `${util.apiAdd}/collections?search=${req.query.search}` : `${util.apiAdd}/collections`;

        let collectionsResult = await axios.get(collectionQ);
        if (collectionsResult.data.status !== 200) throw new util.SystemError(`${collectionsResult.data.status} ${collectionsResult.data.message}`);

        let collections = collectionsResult.data.response;
        collections = await util.slicer(collections);
        res.render("collections", {collections: collections});

    } catch (err){
        next(err);
    }
});

// get a specific collection
router.get("/collections/:collid", async (req, res, next) => {
    try {
        let owner = [];
        let collections = [];
        let collectionEnd = `${util.apiAdd}/collections/${req.params.collid}`;
        let collectionsEnd = `${util.apiAdd}/users/${req.session.userid}/collections` 

        if (req.session.userid){
            collectionEnd = `${collectionEnd}?userid=${req.session.userid}`;    
        } 

        let collection = await axios.get(collectionEnd);
        if (collection.data.status !== 200) throw new util.SystemError(`${collection.data.status} ${collection.data.message}`);

        if (!collection.data.response.isOwner) {
            owner = await axios.get(`${util.apiAdd}/users/${collection.data.response.ownerID}`);
            if (owner.data.status !== 200) throw new util.SystemError(`${owner.data.status} ${owner.data.message}`);
            owner = owner.data.response;
        } else {
            collections = await axios.get(collectionsEnd);
            if (collections.data.status !== 200) throw new util.SystemError(`${collections.data.status} ${collections.data.message}`); 
            collections = collections.data.response;
        }

        collection = collection.data.response;
        collection.cards = await util.slicer(collection.cards);
    
        res.render("collection", {
            cards: collection.cards,
            collection: collection,
            collections: collections,
            owner: owner
        });
    } catch (err) {
        next(err);
    }
});

// create a collection
router.post("/createcoll", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    let body = {
        collname: req.body.collname
    };

    try {
        body = querystring.stringify(body);
        let createResult = await axios.post(`${util.apiAdd}/users/${userID}/collections`, body);
        if (createResult.data.status !== 200) throw new util.SystemError(`${createResult.data.status} ${createResult.data.message}`);

        res.redirect(`/collections/${createResult.data.response.id}`);
    } catch (err){
        next(err);
    }
});

// delete a collection
router.post("/deletecoll", [auth], async (req, res, next) => {
    try {
        let deleteResult = await axios.delete(`${util.apiAdd}/users/${req.session.userid}/collections/${req.body.collid}`);
        if (deleteResult.data.status != 200) throw new util.SystemError(`${deleteResult.data.status} ${deleteResult.data.message}`);

        res.redirect("/mycollections")
    } catch (err) {
        next(err);
    }
});

// add a card to a collection
router.post("/addcard", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    let body = {
        cardid: req.body.cardid,
    }

    try {
        body = querystring.stringify(body);
        let addResult = await axios.post(`${util.apiAdd}/users/${userID}/collections/${req.body.collid}`, body);

        if (addResult.data.status === 409) {
            res.redirect(`/card/${req.body.cardid}?error=409`);
            return;
        } else if (addResult.data.status != 200){
            throw new util.SystemError(`${addResult.data.status} ${addResult.data.message}`);
        }
    
        res.redirect(`/collections/${req.body.collid}`)
    } catch (err) {
        next(err);     
    }
});

// remove a card from a collection
router.post("/removecard", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    try {
        let removeResult = await axios.delete(`${util.apiAdd}/users/${userID}/collections/${req.body.collid}/card/${req.body.cardid}`);

        if (removeResult.data.status != 200) throw new util.SystemError(`${removeResult.data.status} ${removeResult.data.message}`);
        
    
        res.redirect(`/collections/${req.body.collid}`)
    } catch (err) {
        next(err);     
    }
});

// rate a collection
router.post("/ratecollection", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    let body = {
        userid: userID,
        rating: req.body.rating
    };

    try {
        body = querystring.stringify(body);
        let rateResult = await axios.post(`${util.apiAdd}/collections/${req.body.collid}/ratings`, body);

        if (rateResult.data.status !== 200) throw new util.SystemError(`${rateResult.data.status} ${rateResult.data.message}`);

        res.redirect(`/collections/${req.body.collid}`);
    } catch (err) {
        next(err);
    }
});

// unrate a collection
router.post("/unratecollection", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    try {
        let rateResult = await axios.delete(`${util.apiAdd}/collections/${req.body.collid}/ratings/${userID}`);
        if (rateResult.data.status !== 200) throw new util.SystemError(`${rateResult.data.status} ${rateResult.data.message}`);

        res.redirect(`/collections/${req.body.collid}`);
    } catch (err) {
        next(err);
    }
});

// comment on a collection
router.post("/commentcollection", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    let body = {
        userid: userID,
        comment: req.body.comment
    };
    
    try {
        body = querystring.stringify(body);
        let commentResult = await axios.post(`${util.apiAdd}/collections/${req.body.collid}/comments`, body);
        if (commentResult.data.status != 200) throw new util.SystemError(`${commentResult.data.status} ${commentResult.data.message}`);

        res.redirect(`/collections/${req.body.collid}`);
    } catch (err){
        next(err);
    }
});

module.exports = router;
