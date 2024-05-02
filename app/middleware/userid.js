// middleware to give ejs constant access to the user ID var
// https://stackoverflow.com/questions/37183766/how-to-get-the-session-value-in-ejs
const userID = (req, res, next) => {
    res.locals.userid = req.session.userid;
    next();
}

module.exports = userID;