import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

export default function Attempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { [questionId]: choiceId }
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/student/attempts/${attemptId}`, {
          method: "GET",
          headers: authHeaders(),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || `Failed to load attempt (HTTP ${res.status})`);
        }

        setAttempt(data);
      } catch (e) {
        setError(e.message || "Failed to load attempt");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const questions = useMemo(() => {
    
    return attempt?.quiz?.questions || attempt?.questions || [];
  }, [attempt]);

  const handlePick = (questionId, choiceId) => {
    setSelected((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    setError("");

    
    const answers = questions.map((q) => ({
      question_id: q.id,
      choice_id: selected[q.id] ?? null,
    }));

    
    const missing = answers.filter((a) => !a.choice_id);
    if (missing.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/student/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ answers }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Submit failed (HTTP ${res.status})`);
      }

    
      navigate(`/student/attempts/${attemptId}/result`);
    } catch (e) {
      setError(e.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 rounded bg-gray-900 text-white"
          onClick={() => navigate("/student/quizzes")}
        >
          Back to quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>

      {attempt?.score != null && (
        <div className="mb-4 p-4 rounded border bg-white">
          <div className="font-semibold">Result</div>
          <div className="text-sm text-gray-700">
            Score: {attempt.score} / {attempt.max_score ?? "?"}
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-gray-600">No questions found.</div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded-xl p-4 bg-white">
              <div className="font-semibold">
                {idx + 1}. {q.statement}
              </div>

              <div className="mt-3 space-y-2">
                {(q.choices || []).map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={selected[q.id] === c.id}
                      onChange={() => handlePick(q.id, c.id)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}