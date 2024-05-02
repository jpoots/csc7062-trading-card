const createError = require("http-errors");

// error handler
const errHandler =  (err, req, res, nex) => {
    if (!(err instanceof createError.HttpError)) err = createError.InternalServerError();
        
    res.json({
        status: err.status,
        message: err.message
    });
}

module.exports = errHandler