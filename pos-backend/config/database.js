const mongoose = require("mongoose");
const dns = require("dns");
const config = require("./config");

// Force reliable public DNS resolvers for SRV lookups.
// Some ISPs/routers intermittently fail to resolve _mongodb._tcp SRV records
// using the system default DNS, causing ECONNREFUSED querySrv errors.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.databaseURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
    console.error("❌ Full MongoDB Error:");
    console.error(error);
    process.exit(1);
}
}

module.exports = connectDB;