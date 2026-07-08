const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");


const isVerifiedUser = async (req, res, next) => {
    try{

        let accessToken = req.cookies?.accessToken;

        if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
            accessToken = req.headers.authorization.split(" ")[1];
        }

        if(!accessToken){
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        const user = await User.findById(decodeToken._id);
        if(!user){
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        req.user = user;
        next();

    }catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}

// Restricts a route to specific user roles, e.g. router.post("/", isVerifiedUser, restrictTo("Admin"), createStaff)
// Must run after isVerifiedUser, since it relies on req.user being set.
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const error = createHttpError(403, "You do not have permission to perform this action!");
            return next(error);
        }

        next();
    }
}

module.exports = { isVerifiedUser, restrictTo };