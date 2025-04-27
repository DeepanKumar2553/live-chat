import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import refreshReducer from './refreshSidebar'
import normalRefreshReducer from './normalRefresh'

export const store = configureStore({
    reducer: {
        themeKey: themeReducer,
        refreshKey: refreshReducer,
        normalRefreshKey: normalRefreshReducer,
    },
})