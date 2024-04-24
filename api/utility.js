const createError = require("http-errors");

const errorHandler =  (err, res) => {
    if (!(err instanceof createError.HttpError)) err = createError.InternalServerError();
        
    res.json({
        status: err.status,
        message: err.message
    });
}

module.exports = {
    errorHandler: errorHandler,
};
