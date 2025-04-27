import { createSlice } from '@reduxjs/toolkit'

const refreshSidebarSlice = createSlice({
    name: 'refreshKey',
    initialState: false,
    reducers: {
        refreshSidebarFun: (state) => !state,
    },
})

export const { refreshSidebarFun } = refreshSidebarSlice.actions
export default refreshSidebarSlice.reducer