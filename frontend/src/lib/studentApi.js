import { api } from "./api";


export const studentApi = {
  listQuizzes: () => api.get("/student/quizzes"),
  startQuiz: (quizId) => api.post(`/student/quizzes/${quizId}/start`),
  getAttempt: (attemptId) => api.get(`/student/attempts/${attemptId}`),
  submitAttempt: (attemptId, payload) =>
    api.post(`/student/attempts/${attemptId}/submit`, payload),
};