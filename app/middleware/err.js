const util = require("../serverfuncs/utility");

// error handling
const defaultError = "500 Internal server error";
const errorHandler = (err, req, res, next) => {
    try {
        let errorMessage = err instanceof util.SystemError ? err.message : defaultError;
    
        res.render("error", {
            message: errorMessage
        });
    } catch (err) {
        res.json({
            stauts: 500,
            message: "Internal server error"
        });
    }

};

module.exports = errorHandler;