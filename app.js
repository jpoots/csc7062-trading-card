const express = require("express");
const path = require("path");

// set up app
const app = express();
app.set('view engine', 'ejs');
const PORT = 3000;

// css and images
app.use(express.static(path.join(__dirname, "./public")));

// homepage
app.get("/", (req, res) => {
    res.render("index");
});

// login
app.get("/login", (req, res) => {
    res.render("login");
});

// register
app.get("/register", (req, res) => {
    res.render("register");
});

// browse
app.get("/browse", (req, res) => {
    res.render("browse");
});

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})