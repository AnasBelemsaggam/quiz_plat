import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentApi } from "../../lib/studentApi";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await studentApi.listQuizzes();
        setQuizzes(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleOpen = async (quizId) => {
    setStartingId(quizId);
    try {
      const { data } = await studentApi.startQuiz(quizId);

      
      const attemptId = data?.id ?? data?.attempt_id ?? data?.attempt?.id;

      if (!attemptId) {
        throw new Error("Start quiz did not return attempt id");
      }

      navigate(`/student/attempts/${attemptId}`);
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

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

              <div className="mt-4">
                <button
                  onClick={() => handleOpen(q.id)}
                  disabled={startingId === q.id}
                  className="inline-flex px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
                >
                  {startingId === q.id ? "Starting..." : "Open"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}