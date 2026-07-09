const Staff = require("../models/Staff");
const Order = require("../models/orderModel");

// Get Staff Report
// For every staff member: how many orders they've taken (any status),
// how much revenue those orders generated (Completed/paid orders only,
// same convention as the dashboard + sales reports), and how much of
// that revenue landed today.
exports.getStaffReport = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const staffList = await Staff.find().sort({ name: 1 }).lean();

    const orderStats = await Order.aggregate([
      {
        $match: { staff: { $ne: null } },
      },
      {
        $group: {
          _id: "$staff",
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$orderStatus", "Completed"] },
                { $ifNull: ["$bills.totalWithTax", 0] },
                0,
              ],
            },
          },
          todayRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$orderStatus", "Completed"] },
                    { $gte: ["$createdAt", todayStart] },
                    { $lte: ["$createdAt", todayEnd] },
                  ],
                },
                { $ifNull: ["$bills.totalWithTax", 0] },
                0,
              ],
            },
          },
          todayOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", todayStart] },
                    { $lte: ["$createdAt", todayEnd] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsByStaffId = new Map(
      orderStats.map((stat) => [String(stat._id), stat])
    );

    const data = staffList.map((member) => {
      const stats = statsByStaffId.get(String(member._id)) || {};

      return {
        _id: member._id,
        name: member.name,
        role: member.role,
        status: member.status,
        totalOrders: stats.totalOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        todayOrders: stats.todayOrders || 0,
        todayRevenue: stats.todayRevenue || 0,
      };
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

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