const express = require("express");
const routers = require("./routes/routes")
const path = require("path");
const mysql = require("mysql2");
const sessions = require("express-session")
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv")

// set up app
const app = express();
app.set('view engine', 'ejs');

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

// setup dotenv
dotenv.config("/.env");
const PORT = process.env.APP_PORT;

// middleware and routes
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({extended : true}));
app.use(routers);

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})