import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/student/quizzes");
        setQuizzes(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const start = async (quizId) => {
    setErr("");
    try {
      const { data } = await api.post(`/student/quizzes/${quizId}/start`);
      navigate(`/student/attempts/${data.id}`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to start");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Available Quizzes</h1>

      {quizzes.length === 0 ? (
        <div className="text-gray-600">No quizzes available.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <div key={q.id} className="border rounded-xl p-5 bg-white shadow-sm">
              <div className="font-semibold text-lg">{q.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                Duration: {q.duration_minutes} min
              </div>

              <button
                onClick={() => start(q.id)}
                className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}