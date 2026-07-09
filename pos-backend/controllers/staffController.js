const Staff = require("../models/Staff");
const Order = require("../models/orderModel");

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

// Staff Reports
// Returns, for every staff member: how many orders they've taken in
// total, their all-time revenue from completed orders, and revenue
// from orders they completed today.
exports.getStaffReports = async (req, res, next) => {
  try {
    const staffList = await Staff.find().sort({ name: 1 }).lean();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totals, todayTotals] = await Promise.all([
      // Total orders taken (any status) + all-time revenue from the
      // ones that were actually completed & paid.
      Order.aggregate([
        { $match: { staff: { $ne: null } } },
        {
          $group: {
            _id: "$staff",
            totalOrders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$orderStatus", "Completed"] },
                  { $ifNull: ["$bills.totalWithTax", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Revenue from orders completed today only.
      Order.aggregate([
        {
          $match: {
            staff: { $ne: null },
            orderStatus: "Completed",
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: "$staff",
            todayRevenue: { $sum: { $ifNull: ["$bills.totalWithTax", 0] } },
          },
        },
      ]),
    ]);

    const totalsMap = new Map(
      totals.map((entry) => [String(entry._id), entry])
    );
    const todayMap = new Map(
      todayTotals.map((entry) => [String(entry._id), entry.todayRevenue])
    );

    const data = staffList.map((staff) => {
      const entry = totalsMap.get(String(staff._id));

      return {
        _id: staff._id,
        name: staff.name,
        role: staff.role,
        status: staff.status,
        totalOrders: entry?.totalOrders || 0,
        revenue: entry?.revenue || 0,
        todayRevenue: todayMap.get(String(staff._id)) || 0,
      };
    });

    res.json({
      success: true,
      count: data.length,
      data,
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