const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Customer = require("../models/customerModel");
const config = require("../config/config");

const setCustomerCookie = (res, customerId) => {
  const accessToken = jwt.sign({ _id: customerId }, config.accessTokenSecret, {
    expiresIn: "30d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("customerAccessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return accessToken;
};

// =======================================================
// Register (sign up to order for yourself)
// =======================================================
// A walk-in customer's name/phone may already exist in the Customer
// collection from a waiter taking their order the old way (no
// password set). If so, signing up with that same phone "claims"
// that existing record instead of creating a duplicate.
const registerCustomer = async (req, res, next) => {
  try {
    const { name, phone, password, email } = req.body;

    if (!name || !phone || !password) {
      return next(createHttpError(400, "Name, phone and password are required!"));
    }

    let customer = await Customer.findOne({ phone }).select("+password");

    if (customer) {
      if (customer.password) {
        return next(
          createHttpError(400, "An account with this phone number already exists. Please login instead.")
        );
      }

      // Claim the existing walk-in record.
      customer.name = name;
      customer.password = password;
      if (email) customer.email = email;
      await customer.save();
    } else {
      customer = new Customer({ name, phone, password, email });
      await customer.save();
    }

    const accessToken = setCustomerCookie(res, customer._id);

    res.status(201).json({
      success: true,
      message: "Account created!",
      data: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// =======================================================
// Login
// =======================================================
const loginCustomer = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return next(createHttpError(400, "Phone and password are required!"));
    }

    const customer = await Customer.findOne({ phone }).select("+password");

    if (!customer || !customer.password) {
      return next(createHttpError(401, "Invalid credentials!"));
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid credentials!"));
    }

    const accessToken = setCustomerCookie(res, customer._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// =======================================================
// Logout
// =======================================================
const logoutCustomer = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("customerAccessToken", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });
    res.status(200).json({ success: true, message: "Logged out!" });
  } catch (error) {
    next(error);
  }
};

// =======================================================
// Current logged-in customer
// =======================================================
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        _id: req.customer._id,
        name: req.customer.name,
        phone: req.customer.phone,
        email: req.customer.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerCustomer, loginCustomer, logoutCustomer, getMe };
