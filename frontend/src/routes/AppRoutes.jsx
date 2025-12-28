import { Navigate, useRoutes } from "react-router-dom";
import Home from "../pages/landing/Home";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";

import AdminDashboard from "../pages/admin/Dashboard";
import TeacherDashboard from "../pages/teacher/Dashboard";
import StudentQuizzes from "../pages/student/Quizzes";
import StudentQuizDetails from "../pages/student/QuizDetails";
import StudentAttempt from "../pages/student/Attempt";
import StudentResult from "../pages/student/Result";
import TeacherQuizzes from "../pages/teacher/Quizzes";
import TeacherQuizQuestions from "../pages/teacher/QuizQuestions";

export default function AppRoutes() {
  return useRoutes([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },

    {
      element: <ProtectedRoute roles={["admin"]} />,
      children: [{ path: "/admin", element: <AdminDashboard /> }],
    },
    {
      element: <ProtectedRoute roles={["teacher"]} />,
      children: [{ path: "/teacher", element: <TeacherDashboard /> }],
    },
    {
  element: <ProtectedRoute roles={["student"]} />,
  children: [
    { path: "/student", element: <Navigate to="/student/quizzes" replace /> },
    { path: "/student/quizzes", element: <StudentQuizzes /> },
    { path: "/student/attempts/:attemptId", element: <StudentAttempt /> },
    { path: "/student/attempts/:attemptId/result", element: <StudentResult /> },
  ],
},
{
  element: <ProtectedRoute roles={["teacher"]} />,
  children: [
    { path: "/teacher", element: <Navigate to="/teacher/quizzes" replace /> },
    { path: "/teacher/quizzes", element: <TeacherQuizzes /> },
    { path: "/teacher/quizzes/:quizId", element: <TeacherQuizQuestions /> },
  ],
},
  ]);
}