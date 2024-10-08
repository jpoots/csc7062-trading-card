// authenticates a user is logged in
const auth = (req, res, next) => {
    if (req.session.userid) {
        next();
    } else {
        res.redirect("/login");
    }
};

module.exports = auth;