const createError = require("http-errors");
const errHandler = require("./err");

// middleware to authenticate user access level
const admin = async (req, res, next) => {
    try {
        if (!req.admin) throw new createError.Unauthorized();
        next();
    } catch (err) {
        errHandler(err, req, res, next);
    }
}

module.exports = admin;