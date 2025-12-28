import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function Result() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/student/attempts/${attemptId}`);
        setAttempt(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load result");
      }
    })();
  }, [attemptId]);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!attempt) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Result</h1>

      <div className="mt-4 border rounded-xl p-6 bg-white shadow-sm">
        <div className="text-sm text-gray-600">Quiz</div>
        <div className="font-semibold">{attempt.quiz?.title}</div>

        <div className="mt-4 text-sm text-gray-600">Score</div>
        <div className="text-3xl font-bold">
          {attempt.score ?? 0} / {attempt.max_score ?? 0}
        </div>

        <Link
          to="/student/quizzes"
          className="inline-flex mt-6 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
        >
          Back to quizzes
        </Link>
      </div>
    </div>
  );
}