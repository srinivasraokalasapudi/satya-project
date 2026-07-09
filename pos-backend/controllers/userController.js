const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {

        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }

        // Only a logged-in Admin is trusted to choose a role (e.g. to
        // create another Admin or a Cashier). Anyone signing up
        // publicly/anonymously always gets the safe, view-only
        // "Waiter" role, no matter what the request body claims -
        // this stops someone from self-promoting to Admin.
        const requesterIsAdmin = req.user && req.user.role === "Admin";
        const finalRole = requesterIsAdmin && role ? role : "Waiter";

        const user = { name, phone, email, password, role: finalRole };
        const newUser = User(user);
        await newUser.save();

        // Only auto sign-in for a genuine public/anonymous sign-up. If
        // an Admin is creating this account on someone else's behalf,
        // do NOT set the accessToken cookie - that would silently log
        // the Admin out of their own session and into the new account.
        if (!requesterIsAdmin) {
            const accessToken = jwt.sign({_id: newUser._id}, config.accessTokenSecret, {
                expiresIn : '1d'
            });

            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                sameSite: isProduction ? "none" : "lax",
                secure: isProduction,
            });

            return res.status(201).json({
                success: true,
                message: "New user created!",
                data: newUser,
                accessToken: accessToken
            });
        }

        res.status(201).json({
            success: true,
            message: "New user created!",
            data: newUser
        });


    } catch (error) {
        next(error);
    }
}


const login = async (req, res, next) => {

    try {
        
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });

        res.status(200).json({success: true, message: "User login successfully!", 
            data: isUserPresent,
            accessToken: accessToken
        });


    } catch (error) {
        next(error);
    }

}

const getUserData = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {

        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });
        res.status(200).json({success: true, message: "User logout successfully!"});

    } catch (error) {
        next(error);
    }
}




module.exports = { register, login, getUserData, logout }