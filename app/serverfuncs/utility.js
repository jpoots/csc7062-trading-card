const dotenv = require("dotenv");

// API address
dotenv.config({ path: "../.env" })
const apiAdd = process.env.API_ADDRESS;

// slicing function
const slicer = async (list) => {
    const rowSize = 5;
    let sliced = [];
    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
    for (let i = 0; i < list.length; i += rowSize) {
        const chunk = list.slice(i, i + rowSize);
        sliced.push(chunk);
    }
    // end of reference
    return sliced;
}

// custom error to improve error message display
// https://stackoverflow.com/questions/38504780/how-can-i-identify-custom-error
function SystemError(message = "") {
    this.message = message;
  }
SystemError.prototype = new Error();

// error handling
const defaultError = "500 Internal server error";
const errorHandler = (err, res) => {
    let errorMessage = err instanceof SystemError ? err.message : defaultError;

    res.render("error", {
        message: errorMessage
    });     
};

// abstraction of method to improve code reuse
const renderAccountMessage = (res, userData, message) => {
    res.render("account", {
        email: userData.email_address,
        displayName: userData.display_name,
        avatar: userData.avatar_url,
        message: message
    });
};

module.exports = {
    slicer: slicer,
    SystemError: SystemError,
    errorHandler: errorHandler,
    apiAdd: apiAdd,
    renderAccountMessage: renderAccountMessage
};