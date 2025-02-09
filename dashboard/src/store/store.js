import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import forgotResetPasswordReducer from "./slices/forgotResetPasswordSlice";
import messageReducer from "./slices/messageSlice";
import timelineReducer from "./slices/timelineSlice";
import skillReducer from "./slices/skillSlice";
import softwareApplicationsReducer from "./slices/softwareApplicationSlice";
import projectReducer from "./slices/projectSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        forgotPassword: forgotResetPasswordReducer,
        skill: skillReducer,
        project: projectReducer,
        messages: messageReducer,
        timeline: timelineReducer,
        softwareApplications: softwareApplicationsReducer,
    },
});