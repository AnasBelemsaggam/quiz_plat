import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../../lib/teacherApi";

export default function TeacherQuizQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // form
  const [statement, setStatement] = useState("");
  const [points, setPoints] = useState(1);
  const [choices, setChoices] = useState(["", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    const trimmed = choices.map((c) => c.trim());
    return (
      statement.trim().length > 0 &&
      Number(points) > 0 &&
      trimmed.every((c) => c.length > 0) &&
      correctIndex >= 0 &&
      correctIndex < choices.length
    );
  }, [statement, points, choices, correctIndex]);

  const loadQuiz = async () => {
    setErr("");
    setOkMsg("");
    setLoading(true);
    try {
      const { data } = await teacherApi.getQuiz(quizId);
      setQuiz(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    
  }, [quizId]);

  const addChoice = () => setChoices((prev) => [...prev, ""]);
  const removeChoice = (idx) => {
    setChoices((prev) => prev.filter((_, i) => i !== idx));
    setCorrectIndex((prev) => (prev === idx ? 0 : prev > idx ? prev - 1 : prev));
  };
  const updateChoice = (idx, val) =>
    setChoices((prev) => prev.map((c, i) => (i === idx ? val : c)));

  const submitQuestion = async () => {
    setErr("");
    setOkMsg("");

    if (!canSubmit) {
      setErr("Please fill statement, points, all choices, and select correct answer.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        statement: statement.trim(),
        points: Number(points),
        choices: choices.map((c) => ({ label: c.trim() })),
        correct_index: Number(correctIndex),
      };

      await teacherApi.addQuestion(quizId, payload);

      setOkMsg("Question added ✅");
      setStatement("");
      setPoints(1);
      setChoices(["", "", ""]);
      setCorrectIndex(0);

      await loadQuiz();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!quiz) return <div className="p-6 text-red-600">{err || "Quiz not found"}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/teacher/quizzes")}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to quizzes
      </button>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Duration: {quiz.duration_minutes} min ·{" "}
            <span className={quiz.is_published ? "text-green-700" : "text-gray-700"}>
              {quiz.is_published ? "Published" : "Draft"}
            </span>
          </p>
        </div>
      </div>

      {(err || okMsg) && (
        <div
          className={[
            "mt-4 text-sm p-3 rounded border",
            err
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700",
          ].join(" ")}
        >
          {err || okMsg}
        </div>
      )}

      {}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Questions</h2>

        {quiz.questions?.length ? (
          <div className="mt-3 space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="border rounded-xl p-4 bg-white">
                <div className="font-semibold">
                  {idx + 1}. {q.statement}{" "}
                  <span className="text-sm text-gray-500">({q.points} pt)</span>
                </div>

                <div className="mt-3 grid gap-2">
                  {(q.choices || []).map((c) => (
                    <div
                      key={c.id}
                      className={[
                        "text-sm px-3 py-2 rounded border",
                        c.is_correct ? "border-green-300 bg-green-50" : "border-gray-200 bg-white",
                      ].join(" ")}
                    >
                      {c.label} {c.is_correct ? "✅" : ""}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-gray-600">No questions yet.</div>
        )}
      </div>

      {/* Add question form */}
      <div className="mt-8 border rounded-2xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold">Add a question</h2>

        <div className="mt-4 grid gap-4">
          <div>
            <label className="text-sm font-medium">Statement</label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
              rows={3}
              placeholder="Write the question..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Points</label>
              <input
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="mt-1 w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Correct choice</label>
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="mt-1 w-full border rounded-lg p-3"
              >
                {choices.map((label, idx) => (
                  <option key={idx} value={idx}>
                    Choice {idx + 1}{label.trim() ? ` — ${label.trim()}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Choices</label>
              <button
                type="button"
                onClick={addChoice}
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
              >
                + Add choice
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {choices.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={c}
                    onChange={(e) => updateChoice(idx, e.target.value)}
                    className="flex-1 border rounded-lg p-3"
                    placeholder={`Choice ${idx + 1}`}
                  />
                  {choices.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      className="px-3 py-2 rounded-md border hover:bg-gray-50 text-sm"
                      title="Remove choice"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={submitQuestion}
              disabled={!canSubmit || saving}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}