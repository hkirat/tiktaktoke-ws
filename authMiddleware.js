const AUTH_SECRET = "!23random";
const jwt = require("jsonwebtoken");

function middleware(req, res, next) {
    const token = req.headers.token;
    try {
        const {userId} = jwt.verify(token, AUTH_SECRET);
        req.userId = userId;
        next();
    } catch(e) {
        res.status(403).json({
            message: "Incorrect token"
        })
    }
}

module.exports = {
    AUTH_SECRET,
    middleware
}