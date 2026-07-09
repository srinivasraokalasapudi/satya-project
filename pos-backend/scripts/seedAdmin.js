/**
 * Creates (or upgrades) the Admin login account.
 *
 * This is the ONLY way to create the first Admin account, since the
 * /api/user/register endpoint now requires an existing Admin to be
 * logged in before it will create any new account (including more
 * admins). Run this once against your database, then log in with
 * these credentials from the app.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * You can override the defaults below with environment variables
 * instead of editing this file:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD
 */

require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config/config");
const User = require("../models/userModel");

const ADMIN_NAME = process.env.ADMIN_NAME || "Satya";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gmail-satya@gmail.com";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Satya@123569";

const run = async () => {
  try {
    await mongoose.connect(config.databaseURI);
    console.log("Connected to database.");

    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      // Update existing account to make sure it's an Admin with the
      // requested password. Setting .password and calling .save()
      // (rather than findOneAndUpdate) so the pre-save hook re-hashes it.
      admin.name = ADMIN_NAME;
      admin.phone = ADMIN_PHONE;
      admin.password = ADMIN_PASSWORD;
      admin.role = "Admin";
      await admin.save();
      console.log(`Existing user updated to Admin: ${ADMIN_EMAIL}`);
    } else {
      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        password: ADMIN_PASSWORD,
        role: "Admin",
      });
      await admin.save();
      console.log(`Admin account created: ${ADMIN_EMAIL}`);
    }

    console.log("\nDone. You can now log in with:");
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(
      "\nIMPORTANT: change this password after your first login, and don't commit real credentials to source control."
    );
  } catch (error) {
    console.error("Failed to seed admin account:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
