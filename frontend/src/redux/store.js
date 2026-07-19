import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import resumeReducer from "./slices/resumeSlice";
import jobReducer from "./slices/jobSlice";
import matchReducer from "./slices/matchSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    job: jobReducer,
    match: matchReducer,
    ui: uiReducer,
  },
});
