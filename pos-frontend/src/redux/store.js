import { configureStore } from "@reduxjs/toolkit";

import customerReducer from "./slices/customerSlice";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import ordersReducer from "./slices/orderSlice";
import dinerReducer from "./slices/dinerSlice";

const store = configureStore({
  reducer: {
    customer: customerReducer,
    cart: cartReducer,
    user: userReducer,
    orders: ordersReducer,
    diner: dinerReducer,
  },

  devTools: import.meta.env.MODE !== "production",
});

export default store;