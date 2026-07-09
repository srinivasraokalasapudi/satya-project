const mongoose = require("mongoose");
const createHttpError = require("http-errors");

const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Stats = require("../models/statsModel");
const Staff = require("../models/Staff");
const { startOfDay, startOfWeek, startOfMonth } = require("../utils/dateRanges");
// =======================================
// Helpers
// =======================================

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getStats = async () => {

    let stats = await Stats.findOne();

    if (!stats) {

        const created = await Stats.create([
            {
                totalOrders: 0,
                totalEarnings: 0,
            },
        ]);

        stats = created[0];
    }

    return stats;
};

// Bumps a staff member's performance counters when one of their orders
// is completed: total orders/revenue go up forever, while today/week/
// month buckets reset themselves once the stored bucket belongs to a
// past period (so nothing needs a scheduled job to roll them over).
const updateStaffStats = async (staffId, amount) => {
  if (!staffId) return;

  const staffDoc = await Staff.findById(staffId);

  if (!staffDoc) return;

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  if (
    !staffDoc.todayDate ||
    startOfDay(staffDoc.todayDate).getTime() !== todayStart.getTime()
  ) {
    staffDoc.todayRevenue = 0;
    staffDoc.todayDate = todayStart;
  }

  if (
    !staffDoc.weekStartDate ||
    new Date(staffDoc.weekStartDate).getTime() !== weekStart.getTime()
  ) {
    staffDoc.weeklyRevenue = 0;
    staffDoc.weekStartDate = weekStart;
  }

  if (
    !staffDoc.monthStartDate ||
    new Date(staffDoc.monthStartDate).getTime() !== monthStart.getTime()
  ) {
    staffDoc.monthlyRevenue = 0;
    staffDoc.monthStartDate = monthStart;
  }

  staffDoc.totalOrders += 1;
  staffDoc.totalRevenue += amount;
  staffDoc.todayRevenue += amount;
  staffDoc.weeklyRevenue += amount;
  staffDoc.monthlyRevenue += amount;

  await staffDoc.save();
};

const successResponse = (
  res,
  message,
  data = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (next, status, message) => {
  return next(createHttpError(status, message));
};

const emitDashboardUpdate = (req, event, payload = {}) => {
  const io = req.app.get("io");

  if (io) {
    io.emit(event, {
      ...payload,
      timestamp: new Date(),
    });
    io.emit("dashboard:update", {
      reason: event,
      timestamp: new Date(),
    });
  }
};
// =======================================
// Add Order
// =======================================

const addOrder = async (req, res, next) => {
  

  try {
    

    const {
      customer,
      customerDetails,
      bills,
      items,
      table,
      paymentMethod,
      paymentData,
      staff,
    } = req.body;

    if (!customerDetails)
      return errorResponse(next, 400, "Customer details are required.");

    if (!bills)
      return errorResponse(next, 400, "Bill details are required.");

    if (!items || !items.length)
      return errorResponse(next, 400, "Order items are required.");

    let staffData = null;

    if (staff) {
      if (!validateObjectId(staff)) {
        return errorResponse(next, 400, "Invalid staff ID.");
      }

      staffData = await Staff.findById(staff);

      if (!staffData) {
        return errorResponse(next, 404, "Staff not found.");
      }
    }

    let tableData = null;

    if (table) {
      tableData = await Table.findById(table);

      if (!tableData) {
       
        
        return errorResponse(next, 404, "Table not found.");
      }

      if (tableData.status === "Occupied") {
        
        
        return errorResponse(next, 400, "Table already occupied.");
      }
    }

    const order = await Order.create(
      [
        {
          customer,
          customerDetails,
          bills,
          items,
          table,
          paymentMethod,
          paymentData,
          staff: staffData ? staffData._id : undefined,
          staffDetails: staffData
            ? { name: staffData.name, role: staffData.role }
            : undefined,
          orderStatus: "In Progress",
        },
      ],
      
    );

    const createdOrder = order[0];

    if (tableData) {
      tableData.status = "Occupied";
      tableData.currentOrder = createdOrder._id;
      await tableData.save();
    }

    emitDashboardUpdate(req, "order:created", {
      orderId: createdOrder._id,
      amount: createdOrder.bills?.totalWithTax || 0,
      status: createdOrder.orderStatus,
    });
    
    

    return successResponse(
      res,
      "Order created successfully.",
      createdOrder,
      201
    );
  } catch (error) {
    
    

    console.error(error);

    next(error);
  }
};
// =======================================
// Get All Orders
// =======================================

const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      status = "",
      sort = "desc",
    } = req.query;

    // No status filter by default — return every order (In Progress, Ready,
    // and Completed alike). Callers that want a subset (e.g. only
    // "Completed") pass ?status=Completed explicitly.
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    // Search by customer name
    if (search) {
      query["customerDetails.name"] = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const totalOrders = await Order.countDocuments(query);

    const totalPages = Math.ceil(totalOrders / limitNumber);

    const orders = await Order.find(query)
      .populate("customer")
      .populate("table")
      .populate("staff", "name role")
      .sort({
        createdAt: sort === "asc" ? 1 : -1,
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages,
      totalOrders,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// =======================================
// Get Order By ID
// =======================================

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return errorResponse(next, 400, "Invalid Order ID");
    }

    const order = await Order.findById(id)
      .populate("customer")
      .populate("table")
      .populate("staff", "name role")
      .lean();

    if (!order) {
      return errorResponse(next, 404, "Order not found");
    }

    return successResponse(
      res,
      "Order fetched successfully.",
      order
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// =======================================
// Update Order
// =======================================

const updateOrder = async (req, res, next) => {
  

  try {
    

    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!validateObjectId(id)) {
      
      return errorResponse(next, 400, "Invalid Order ID");
    }

    const order = await Order.findById(id);

    if (!order) {
      
      return errorResponse(next, 404, "Order not found");
    }

    // Prevent duplicate completion
    if (
      order.orderStatus === "Completed" &&
      orderStatus === "Completed"
    ) {
      

      return res.status(200).json({
        success: true,
        message: "Order already completed.",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();
    emitDashboardUpdate(req, "order:updated", {
      orderId: order._id,
      status: order.orderStatus,
    });

    // ==========================
    // Completed Order
    // ==========================

    if (orderStatus === "Completed") {

      const stats = await getStats();

      stats.totalOrders += 1;

      stats.totalEarnings += Number(
        order.bills?.totalWithTax || 0
      );

      await stats.save();

      // Credit the staff member who took this order with the
      // completed sale (total/today/week/month counters).
      if (order.staff) {
        await updateStaffStats(
          order.staff,
          Number(order.bills?.totalWithTax || 0)
        );
      }

      // Release table

      if (order.table) {

        await Table.findByIdAndUpdate(
          order.table,
          {
            status: "Available",
            currentOrder: null,
          },
          
        );

      }

      // Keep completed order for reports.
// Do NOT delete it.

emitDashboardUpdate(req, "order:completed", {
  orderId: order._id,
  amount: order.bills?.totalWithTax || 0,
});

return res.status(200).json({
  success: true,
  message: "Order completed successfully.",
  data: order,
  stats,
});

    }

    

    return res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      data: order,
    });

  } catch (error) {

    

    console.error(error);

    next(error);

  } finally {

    

  }

};
// =======================================
// Delete Order
// =======================================

const deleteOrder = async (req, res, next) => {
  

  try {
    

    const { id } = req.params;

    if (!validateObjectId(id)) {
      
      return errorResponse(next, 400, "Invalid Order ID");
    }

    const order = await Order.findById(id);

    if (!order) {
      
      return errorResponse(next, 404, "Order not found");
    }

    if (order.table) {
      await Table.findByIdAndUpdate(
        order.table,
        {
          status: "Available",
          currentOrder: null,
        },
        
      );
    }

    await Order.findByIdAndDelete(id);
    emitDashboardUpdate(req, "order:deleted", {
      orderId: id,
    });

    

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });

  } catch (error) {

    

    console.error(error);

    next(error);

  } finally {

    

  }
};

// =======================================
// Create Order (self-service, diner logged in via QR code)
// =======================================
// Same idea as addOrder above, but the customer/customerDetails come
// from the authenticated diner (req.customer) instead of being typed
// in by a waiter, and there's no staff member on the order at all -
// a waiter will still see it appear on the Orders board to prepare it.
const createSelfOrder = async (req, res, next) => {
  try {
    const { bills, items, table, paymentMethod } = req.body;

    if (!bills) return errorResponse(next, 400, "Bill details are required.");
    if (!items || !items.length)
      return errorResponse(next, 400, "Order items are required.");
    if (!table) return errorResponse(next, 400, "Table is required.");

    if (!validateObjectId(table)) {
      return errorResponse(next, 400, "Invalid table ID.");
    }

    const tableData = await Table.findById(table);

    if (!tableData) {
      return errorResponse(next, 404, "Table not found.");
    }

    if (tableData.status === "Occupied") {
      return errorResponse(next, 400, "Table already occupied.");
    }

    const order = await Order.create([
      {
        customer: req.customer._id,
        customerDetails: {
          name: req.customer.name,
          phone: req.customer.phone,
          guests: 1,
        },
        bills,
        items,
        table,
        paymentMethod: paymentMethod || "Pay at Table",
        orderStatus: "In Progress",
      },
    ]);

    const createdOrder = order[0];

    tableData.status = "Occupied";
    tableData.currentOrder = createdOrder._id;
    await tableData.save();

    emitDashboardUpdate(req, "order:created", {
      orderId: createdOrder._id,
      amount: createdOrder.bills?.totalWithTax || 0,
      status: createdOrder.orderStatus,
    });

    return successResponse(res, "Order placed successfully.", createdOrder, 201);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// =======================================
// Get My Orders (self-service diner's own order history)
// =======================================
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.customer._id })
      .populate("table")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Orders fetched successfully.", orders);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  createSelfOrder,
  getMyOrders,
};
