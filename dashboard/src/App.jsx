import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ManageProjectsPage from "./pages/ManageProjectsPage";
import ManageSkillsPage from "./pages/ManageSkillsPage";
import ManageTimelinePage from "./pages/ManageTimelinePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UpdateProjectPage from "./pages/UpdateProjectPage";
import ViewprojectPage from "./pages/ViewProjectPage";
import { getAllMessages } from "./store/slices/messageSlice";
import { getAllSkills } from "./store/slices/skillSlice";
import { getAllSoftwareApplications } from "./store/slices/softwareApplicationSlice";
import { getAllTimeline } from "./store/slices/timelineSlice";
import { getUser } from "./store/slices/userSlice";
import { getAllProjects } from "./store/slices/projectSlice";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUser());
    dispatch(getAllSkills());
    dispatch(getAllSoftwareApplications());
    dispatch(getAllMessages());
    dispatch(getAllTimeline());
    dispatch(getAllProjects());
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/manage/skills" element={<ManageSkillsPage />} />
        <Route path="/manage/timeline" element={<ManageTimelinePage />} />
        <Route path="/manage/projects" element={<ManageProjectsPage />} />
        <Route path="/view/project/:id" element={<ViewprojectPage />} />
        <Route path="/update/project/:id" element={<UpdateProjectPage />} />
      </Routes>

      <ToastContainer position="bottom-right" theme="dark" />
    </Router>
  );
};

export default App;
