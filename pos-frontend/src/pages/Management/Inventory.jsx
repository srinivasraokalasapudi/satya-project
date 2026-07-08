import React, { useEffect } from "react";
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const inventory = [
  { id: 1, name: "Basmati Rice", category: "Grains", stock: 50, unit: "kg", status: "In Stock" },
  { id: 2, name: "Paneer", category: "Dairy", stock: 8, unit: "kg", status: "Low Stock" },
  { id: 3, name: "Cooking Oil", category: "Oil", stock: 20, unit: "L", status: "In Stock" },
  { id: 4, name: "Tomatoes", category: "Vegetables", stock: 5, unit: "kg", status: "Low Stock" },
];

const Inventory = () => {
  useEffect(() => {
    document.title = "Satya POS | Inventory";
  }, []);

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 mt-2">
            Manage hotel stock and ingredients.
          </p>
        </div>

        <button className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2">
          <FaPlus />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400">Total Items</p>
          <h2 className="text-white text-3xl font-bold mt-2">120</h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400">In Stock</p>
          <h2 className="text-green-400 text-3xl font-bold mt-2">112</h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400">Low Stock</p>
          <h2 className="text-yellow-400 text-3xl font-bold mt-2">8</h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400">Alerts</p>
          <h2 className="text-red-400 text-3xl font-bold mt-2 flex items-center gap-2">
            <FaExclamationTriangle />
            3
          </h2>
        </div>
      </div>

      <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-700 text-gray-400">
            <tr>
              <th className="text-left p-4">Item</th>
              <th className="text-left">Category</th>
              <th className="text-left">Stock</th>
              <th className="text-left">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-gray-800">
                <td className="p-4 text-white">{item.name}</td>
                <td className="text-gray-300">{item.category}</td>
                <td className="text-white">{item.stock} {item.unit}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.status === "In Stock"
                      ? "bg-green-600 text-white"
                      : "bg-yellow-500 text-black"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-400 hover:text-blue-300">
                      <FaEdit />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
