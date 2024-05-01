const express = require("express");
const path = require("path");
const sessions = require("express-session")
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const axios = require("axios");
const errorHandler = require("../middleware/err")
const router = require("./routes")
const userid = require("../middleware/userid")
 

// set up app
const app = express();
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, '../views'),
    path.join(__dirname, '../views/cardcoll'),
    path.join(__dirname, '../views/messaging'),
    path.join(__dirname, '../views/misc'),
    path.join(__dirname, '../views/mycards'),
    path.join(__dirname, '../views/user'),
]);

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

app.use(userid);
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