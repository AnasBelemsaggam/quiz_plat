import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function TakeQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/student/attempts/${attemptId}`);
        setAttempt(data);

        const startedAt = new Date(data.started_at).getTime();
        const durationMs = (data.quiz.duration_minutes || 10) * 60 * 1000;
        const end = startedAt + durationMs;
        setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load attempt");
      }
    })();
  }, [attemptId]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit(true);
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const timeLabel = useMemo(() => {
    if (secondsLeft === null) return "";
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const choose = (questionId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

const submit = async (auto = false) => {
  if (!attempt || submitting) return;
  setSubmitting(true);
  setErr("");

  try {
    const quiz = attempt.quiz;

    const payload = {
      answers: (quiz.questions || []).map((q) => ({
        question_id: q.id,
        choice_id: answers[q.id] ?? null,
      })),
      auto_submit: auto,
    };

    if (!auto) {
      const missing = payload.answers.filter((a) => !a.choice_id);
      if (missing.length) {
        setErr("Please answer all questions before submitting.");
        setSubmitting(false);
        return;
      }
    }

    await api.post(`/student/attempts/${attempt.id}/submit`, payload);
    navigate(`/student/attempts/${attempt.id}/result`);
  } catch (e) {
    setErr(e?.response?.data?.message || "Submit failed");
    setSubmitting(false);
  }
};

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!attempt) return <div className="p-6">Loading...</div>;

  const quiz = attempt.quiz;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-gray-600 mt-1">Answer then submit.</p>
        </div>

        <div className="rounded-xl border bg-white shadow-sm px-4 py-3">
          <div className="text-xs text-gray-500">Time left</div>
          <div className="text-xl font-bold">{timeLabel}</div>
        </div>
      </div>

      {quiz.questions?.map((q, idx) => (
        <div key={q.id} className="mt-6 border rounded-xl p-5 bg-white shadow-sm">
          <div className="font-semibold">
            {idx + 1}. {q.statement}
          </div>

          <div className="mt-4 space-y-2">
            {q.choices.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === c.id}
                  onChange={() => choose(q.id, c.id)}
                />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {err && (
        <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {err}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          disabled={submitting}
          onClick={() => submit(false)}
          className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}