import React from "react";
import CustomerManagement from "./CustomerManagement";

// Thin wrapper so the standalone /customers route and the "Customers"
// tab on the main Dashboard both render the exact same live view.
const Customers = () => <CustomerManagement />;

export default Customers;
