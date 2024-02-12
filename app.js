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

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})