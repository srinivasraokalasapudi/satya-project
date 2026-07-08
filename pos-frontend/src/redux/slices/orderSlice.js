import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    satya: (state, action) => {
      state.push(action.payload);
    },

    updateOrderStatus: (state, action) => {
      const order = state.find(order => order.id === action.payload.id);

      if (order) {
        order.status = action.payload.status;
      }
    },
  },
});

export const { satya, updateOrderStatus } = orderSlice.actions;

export default orderSlice.reducer;