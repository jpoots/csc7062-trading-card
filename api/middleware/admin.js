const createError = require("http-errors");
const errHandler = require("./err");

const admin = async (req, res, next) => {
    try {
        if (!req.admin) throw new createError.Unauthorized();
        next();
    } catch {
        errHandler(err, req, res, next);
    }
}

module.exports = admin;