const Staff = require("../models/Staff");

// Get All Staff
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// Create Staff
exports.createStaff = async (req, res, next) => {
  try {
    const employee = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update Staff
exports.updateStaff = async (req, res, next) => {
  try {
    const employee = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.json({
      success: true,
      message: "Staff updated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Staff
exports.deleteStaff = async (req, res, next) => {
  try {
    const employee = await Staff.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};