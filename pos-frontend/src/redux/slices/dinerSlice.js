import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  phone: "",
  email: "",
  isAuth: false,
};

const dinerSlice = createSlice({
  name: "diner",
  initialState,
  reducers: {
    setDiner: (state, action) => {
      const { _id, name, phone, email } = action.payload;
      state._id = _id;
      state.name = name;
      state.phone = phone;
      state.email = email;
      state.isAuth = true;
    },

    removeDiner: () => initialState,
  },
});

export const { setDiner, removeDiner } = dinerSlice.actions;
export default dinerSlice.reducer;
