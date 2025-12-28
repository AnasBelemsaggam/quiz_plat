import { api } from "./api";

export const teacherApi = {
  listQuizzes: () => api.get("/teacher/quizzes"),
  createQuiz: (payload) => api.post("/teacher/quizzes", payload),
  getQuiz: (id) => api.get(`/teacher/quizzes/${id}`),
  updateQuiz: (id, payload) => api.put(`/teacher/quizzes/${id}`, payload),
  addQuestion: (id, payload) => api.post(`/teacher/quizzes/${id}/questions`, payload),


  listStudents: () => api.get("/teacher/students"),
  assignQuiz: (quizId, payload) => api.post(`/teacher/quizzes/${quizId}/assign`, payload),


};