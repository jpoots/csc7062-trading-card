const util = require("../utility");

// error handling
const defaultError = "500 Internal server error";
const errorHandler = (err, req, res, next) => {
    let errorMessage = err instanceof util.SystemError ? err.message : defaultError;

    res.render("error", {
        message: errorMessage
    });
};

module.exports = errorHandler;