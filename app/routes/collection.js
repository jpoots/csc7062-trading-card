const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");

//https://blog.logrocket.com/using-axios-set-request-headers/

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

router.get("/collections/:collid", async (req, res, next) => {
    try {
        let collectionEnd = `${util.apiAdd}/collections/${req.params.collid}`;
        let collectionsEnd = `${util.apiAdd}/collections` 

        if (req.session.userid){
            collectionEnd = `${collectionEnd}?userid=${req.session.userid}`;
            collectionsEnd = `${collectionsEnd}?userid=${req.session.userid}`
        } 

        let collection = await axios.get(collectionEnd);
        if (collection.data.status !== 200) throw new util.SystemError(`${collection.data.status} ${collection.data.message}`); 

        collection = collection.data.response;
        collection.cards = await util.slicer(collection.cards);
    
        let collections = await axios.get(collectionsEnd);
        if (collections.data.status !== 200) throw new util.SystemError(`${collections.data.status} ${collections.data.message}`); 

        collections = collections.data.response;
    
        res.render("collection", {
            cards: collection.cards,
            collection: collection,
            collections: collections
        });
    } catch (err) {
        next(err);
    }
});

router.post("/createcoll", async (req, res, next) => {
    let userID = req.session.userid;

    if (userID) {
        let body = {
            userid: userID,
            collname: req.body.collname
        };

        try {
            body = querystring.stringify(body);
            let createResult = await axios.post(`${util.apiAdd}/createcoll`, body);
            if (createResult.data.status !== 200) throw new util.SystemError(`${createResult.data.status} ${createResult.data.message}`);

            res.redirect(`/collections/${createResult.data.response.id}`);
        } catch (err){
            next(err);
        }
    } else {
        res.redirect("/login");
    }
});

router.post("/deletecoll", async (req, res, next) => {
    if (req.session.userid) {
        
        try {
            let deleteResult = await axios.delete(`${util.apiAdd}/deletecoll/${req.body.collid}`);
            if (deleteResult.data.status != 200) throw new util.SystemError(`${deleteResult.data.status} ${deleteResult.data.message}`);

            res.redirect("/mycards/collections")
        } catch (err) {
            next(err);
        }

    } else {
        res.redirect("/login");
    }
});


router.post("/addremovecard", async (req, res, next) => {
    let userID = req.session.userid;

    if (userID){
        let body = {
            userid: userID,
            cardid: req.body.cardid,
            collid: req.body.collid,
        }

        try {
            body = querystring.stringify(body);
            let addResult = await axios.post(`${util.apiAdd}/${req.body.collstatus}card`, body);

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

    } else {
        res.redirect("/login")
    }
});

router.post("/removecard", async (req, res, next) => {
    let userID = req.session.userid;

    if (userID){

        try {
            let removeResult = await axios.delete(`${util.apiAdd}/removecard/${req.body.collid}/${req.body.cardid}`);

            if (removeResult.data.status != 200){
                throw new util.SystemError(`${addResult.data.status} ${addResult.data.message}`);
            }
        
            res.redirect(`/collections/${req.body.collid}`)
        } catch (err) {
            next(err);     
        }
    }
});

router.post("/ratecollection", async (req, res, next) => {
    let userID = req.session.userid;

    if (!userID) {
        res.redirect("/login")
    } else {
        let body = {
            collid: req.body.collid,
            userid: userID,
            rating: req.body.rating
        };

        try {
            body = querystring.stringify(body);
            let rateResult = await axios.post(`${util.apiAdd}/${req.body.ratestatus}collection`, body);

            if (rateResult.data.status !== 200) throw new util.SystemError(`${rateResult.data.status} ${rateResult.data.message}`);

            res.redirect(`/collections/${req.body.collid}`);
        } catch (err) {
            next(err);
        }
    }
});

router.post("/commentcollection", async (req, res, next) => {
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
            let commentResult = await axios.post(`${util.apiAdd}/commentcollection`, body);
            if (commentResult.data.status != 200) throw new util.SystemError(`${commentResult.data.status} ${commentResult.data.message}`);

            res.redirect(`/collections/${req.body.collid}`);
        } catch (err){
            console.log(err)
            next(err);
        }
    }
});

module.exports = router;
