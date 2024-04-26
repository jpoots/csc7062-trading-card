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

router.get("/mycards/collections", async (req, res) => {
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

module.exports = router;