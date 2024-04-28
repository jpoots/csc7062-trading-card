const express = require("express");
const router = express.Router();
const axios = require("axios");
const util = require("../utility");
const auth = require("../middleware/auth");

// mycards
router.get("/mycards", [auth], (req, res) => {
    res.render("mycards")
});

router.get("/mycollections", [auth], async (req, res, next) => {
    let userID = req.session.userid;
        
    try {
        // get collections to populate drop down
        let collections = await axios.get(`${util.apiAdd}/collections?userid=${userID}`);
        if (collections.data.status != 200) throw new util.SystemError(collections.data.message);

        collections = collections.data.response;
        let currentCollection = collections[0];

        if (!currentCollection){
            res.render("mycollections");
        } else {
            res.redirect(`/collections/${currentCollection.collection_id}`);
        }

    } catch (err){
        next(err);
    }
});

router.get("/likedcards", [auth], async (req, res, next) => {
    let userID = req.session.userid;
    try {
        let cards = await axios.get(`${util.apiAdd}/users/${userID}/likedcards`)
        if (cards.data.status !== 200) throw new util.SystemError(`${cards.data.status} ${cards.data.message}`);

        cards = await util.slicer(cards.data.response);

        res.render("browse", {
            cards: cards
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;