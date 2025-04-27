import { createSlice } from "@reduxjs/toolkit"

export const normalSlice = createSlice({
    name: 'normalRefresh',
    initialState: false,
    reducers: {
        setNormalRefresh: (state, action) => action.payload,
    }
})

export const { setNormalRefresh } = normalSlice.actions
export default normalSlice.reducer