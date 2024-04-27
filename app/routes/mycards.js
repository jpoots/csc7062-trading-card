const express = require("express");
const router = express.Router();
const axios = require("axios");
const util = require("../utility");

// mycards
router.get("/mycards", (req, res) => {
    if (!req.session.userid){
        res.redirect("/login")
    } else {
        res.render("mycards")
    }
});

router.get("/mycollections", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login")
    } else {
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
            util.errorHandler(err, res);
        }
    }
});

router.get("/likedcards", async (req, res, next) => {
    let userID = req.session.userid;

    if (userID) {
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

    } else {
        res.redirect("/login");
    }
});

module.exports = router;