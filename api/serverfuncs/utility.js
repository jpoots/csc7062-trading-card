const createError = require("http-errors");

const isPositiveInt = (string) => {
    if (parseInt(string) && parseInt(string) > 0) return true;
    return false;
};

module.exports = {
    isPositiveInt: isPositiveInt
};
