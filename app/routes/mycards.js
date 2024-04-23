const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

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
            let collections = await axios.get(`${API_ADD}/collections?userid=${userID}`);
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

module.exports = router;