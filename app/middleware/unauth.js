// middleware to check for a logged out user
const unauth = (req, res, next) => {
    if (!req.session.userid) {
        next();
    } else {
        res.redirect("/mycards");
    }
};

module.exports = unauth;