import React from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const notifications = [
  {
    id: 1,
    title: "New Order Received",
    message: "Table 5 placed a new order.",
    type: "success",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Low Stock Alert",
    message: "Chicken stock is running low.",
    type: "warning",
    time: "10 min ago",
  },
  {
    id: 3,
    title: "Payment Successful",
    message: "UPI payment received successfully.",
    type: "success",
    time: "25 min ago",
  },
  {
    id: 4,
    title: "System Update",
    message: "Restaurant POS updated successfully.",
    type: "info",
    time: "1 hour ago",
  },
];

const getIcon = (type) => {
  switch (type) {
    case "success":
      return <FaCheckCircle className="text-green-600 text-xl" />;
    case "warning":
      return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
    default:
      return <FaInfoCircle className="text-blue-500 text-xl" />;
  }
};

const Notifications = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBell className="text-3xl text-orange-500" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 flex items-start gap-4"
          >
            {getIcon(item.type)}

            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {item.title}
              </h2>

              <p className="text-gray-600">
                {item.message}
              </p>
            </div>

            <span className="text-gray-400 text-sm">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;