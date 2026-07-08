const Inventory = require("../models/Inventory");

// Get All Inventory
exports.getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// Create Inventory
exports.createInventory = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// Update Inventory
exports.updateInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Inventory
exports.deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};