const admin = async (req, res, next) => {
    if (req.admin) {
        next();
    } else {
        res.json({
            status: 403,
            message: "access denied"
        });
    }
}

module.exports = admin;