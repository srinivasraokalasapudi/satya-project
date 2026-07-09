const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");
const Customer = require("../models/customerModel");


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

// Like isVerifiedUser, but never rejects the request. If a valid token
// is present, req.user is set; otherwise req.user stays undefined and
// the request continues as an anonymous/public request. Used for
// endpoints (like registration) that behave differently for a logged
// in Admin vs. the general public, without requiring login.
const attachUserIfPresent = async (req, res, next) => {
    try {

        let accessToken = req.cookies?.accessToken;

        if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
            accessToken = req.headers.authorization.split(" ")[1];
        }

        if (!accessToken) {
            return next();
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);
        const user = await User.findById(decodeToken._id);

        if (user) {
            req.user = user;
        }

        next();

    } catch (error) {
        // Invalid/expired token on an optional-auth route just means
        // we treat the request as anonymous, not an error.
        next();
    }
}

// =======================================================
// Customer (self-service diner) auth - completely separate
// from staff auth above. Uses its own cookie name so a
// customer's phone and a staff member's laptop can each hold
// their own independent session without clashing.
// =======================================================

const isVerifiedCustomer = async (req, res, next) => {
    try {

        let accessToken = req.cookies?.customerAccessToken;

        if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
            accessToken = req.headers.authorization.split(" ")[1];
        }

        if (!accessToken) {
            const error = createHttpError(401, "Please login to continue!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        const customer = await Customer.findById(decodeToken._id);
        if (!customer) {
            const error = createHttpError(401, "Customer not found!");
            return next(error);
        }

        req.customer = customer;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}

module.exports = { isVerifiedUser, attachUserIfPresent, isVerifiedCustomer };