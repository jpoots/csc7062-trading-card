const express = require("express");
const routers = require("./routes/routes")
const path = require("path");
const mysql = require("mysql2");

// set up app
const app = express();
app.set('view engine', 'ejs');
const PORT = 3000;

// middleware and routes
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({extended : true}));
app.use(routers);

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})