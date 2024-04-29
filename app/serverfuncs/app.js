const express = require("express");
const path = require("path");
const sessions = require("express-session")
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const axios = require("axios");
const errorHandler = require("../middleware/err")
const router = require("./routes")

// set up app
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// setup dotenv
dotenv.config({ path: "../.env" })

// global axios header for api key and post form encoding
axios.defaults.headers.common["x-api-key"] = process.env.API_KEY;
axios.defaults.headers.post[ "Content-Type"] = "application/x-www-form-urlencoded";

// middleware and routes
// set up session
const halfDay = 1000 * 60 * 60 * 12;
app.use(sessions ({
    secret: "sessionPassword",
    saveUninitialized: true,
    cookie: {maxAge: halfDay},
    resave: false
}));

// https://stackoverflow.com/questions/37183766/how-to-get-the-session-value-in-ejs
app.use(function(req, res, next) {
    res.locals.userid = req.session.userid;
    next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({extended : true}));
app.use(router);
app.use(errorHandler)

// start app listening
const PORT = process.env.APP_PORT;
app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})