import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./auth/authSlice";
import projectsReducer from "./projects/projectsSlice";
import projectMembersReducer from "./projectMembers/projectMembersSlice";
import commentsReducer from "./comments/commentsSlice";
import workAreasReducer from "./workAreas/workAreasSlice";
import workTasksReducer from "./workTasks/workTasksSlice";
import taskObjectivesReducer from "./taskObjectives/taskObjectivesSlice";

export const tasco = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    projectMembers: projectMembersReducer,
    comments: commentsReducer,
    workAreas: workAreasReducer,
    workTasks: workTasksReducer,
    taskObjectives: taskObjectivesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof tasco.getState>;
export type AppDispatch = typeof tasco.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
