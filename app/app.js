const express = require("express");
const path = require("path");
const sessions = require("express-session")
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const axios = require("axios");

const user = require("./routes/user");
const card = require("./routes/card");
const expansion = require("./routes/expansion");
const mycards = require("./routes/mycards");
const collection = require("./routes/collection");
const messaging = require("./routes/messaging");
const misc = require("./routes/misc");


// set up app
const app = express();
app.set('view engine', 'ejs');

// set up session
const halfDay = 1000 * 60 * 60 * 12;
app.use(sessions ({
    secret: "sessionPassword",
    saveUninitialized: true,
    cookie: {maxAge: halfDay},
    resave: false
}));

// middleware


// setup dotenv
dotenv.config("/.env");

// global axios header for api key and post form encoding
axios.defaults.headers.common["x-api-key"] = process.env.API_KEY;
axios.defaults.headers.post[ "Content-Type"] = "application/x-www-form-urlencoded";

// middleware and routes
// https://stackoverflow.com/questions/37183766/how-to-get-the-session-value-in-ejs
app.use(function(req, res, next) {
    res.locals.userid = req.session.userid;
    next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({extended : true}));

app.use(user);
app.use(card);
app.use(expansion);
app.use(mycards);
app.use(collection);
app.use(messaging)
app.use(misc);

// start app listening
const PORT = process.env.APP_PORT;
app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})