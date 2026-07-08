import React, { useState } from "react";

const MenuManagement = () => {
  const [menus] = useState([
    {
      id: 1,
      name: "Chicken Biryani",
      category: "Main Course",
      price: 250,
      status: "Available",
    },
    {
      id: 2,
      name: "Paneer Butter Masala",
      category: "Veg",
      price: 220,
      status: "Available",
    },
    {
      id: 3,
      name: "Veg Fried Rice",
      category: "Rice",
      price: 180,
      status: "Available",
    },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Menu Management
        </h1>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Add Dish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Dish</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {menus.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">₹{item.price}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManagement;