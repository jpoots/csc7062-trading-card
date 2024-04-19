const express = require("express");
const routers = require("./routes/routes")
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv")

// set up app
const app = express();
app.set('view engine', 'ejs');

// setup dotenv and pokemon api
dotenv.config();
const PORT = process.env.APP_PORT;

// middleware and routes
app.use(express.urlencoded({ extended: true }));

app.use(routers);

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})