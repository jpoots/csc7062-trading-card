const auth = (req, res, next) => {
    if (false) {
        res.json({
            statsu: 400,
            message: "invalid key"
        })
    }

    next();
}

module.exports = auth;