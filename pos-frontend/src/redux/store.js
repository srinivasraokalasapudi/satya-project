import { configureStore } from "@reduxjs/toolkit";

import customerReducer from "./slices/customerSlice";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import ordersReducer from "./slices/orderSlice";

const store = configureStore({
  reducer: {
    customer: customerReducer,
    cart: cartReducer,
    user: userReducer,
    orders: ordersReducer,
  },

  devTools: import.meta.env.MODE !== "production",
});

export default store;