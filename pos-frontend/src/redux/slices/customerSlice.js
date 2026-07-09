import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null,
    staff: null
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests } = action.payload;
            state.orderId = `${Date.now()}`;
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
        },

        removeCustomer: (state) => {
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.staff = null;
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        },

        setOrderStaff: (state, action) => {
            // { id, name, role }
            state.staff = action.payload;
        }

    }
})


export const { setCustomer, removeCustomer, updateTable, setOrderStaff } = customerSlice.actions;
export default customerSlice.reducer;