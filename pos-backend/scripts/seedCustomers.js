// One-off script to seed 5 sample customers.
//
// Run it from pos-backend/:
//   node scripts/seedCustomers.js
//
// Uses the same MONGODB_URI as the main app (see config/config.js),
// so make sure your .env is set up first. Safe to re-run — customers
// are upserted by phone number instead of duplicated.

const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Customer = require("../models/customerModel");

const sampleCustomers = [
  {
    name: "Ananya Sharma",
    phone: "9876543210",
    email: "ananya.sharma@example.com",
    address: "Banjara Hills, Hyderabad",
    status: "VIP",
    loyaltyPoints: 120,
  },
  {
    name: "Rohan Mehta",
    phone: "9823456781",
    email: "rohan.mehta@example.com",
    address: "Jubilee Hills, Hyderabad",
    status: "Regular",
    loyaltyPoints: 40,
  },
  {
    name: "Priya Nair",
    phone: "9812345678",
    email: "priya.nair@example.com",
    address: "Gachibowli, Hyderabad",
    status: "Regular",
    loyaltyPoints: 15,
  },
  {
    name: "Karan Malhotra",
    phone: "9845123467",
    email: "karan.malhotra@example.com",
    address: "Madhapur, Hyderabad",
    status: "VIP",
    loyaltyPoints: 200,
  },
  {
    name: "Sneha Reddy",
    phone: "9900112233",
    email: "sneha.reddy@example.com",
    address: "Kondapur, Hyderabad",
    status: "Regular",
    loyaltyPoints: 5,
  },
];

const run = async () => {
  await connectDB();

  console.log("Seeding customers...");

  for (const customer of sampleCustomers) {
    const result = await Customer.findOneAndUpdate(
      { phone: customer.phone },
      { $set: customer },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`  ✔ ${result.name} (${result.phone})`);
  }

  console.log(`Done. ${sampleCustomers.length} customers ready.`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Failed to seed customers:", error);
  process.exit(1);
});
