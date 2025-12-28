import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { teacherApi } from "../../lib/teacherApi";

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // create form
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);

  const navigate = useNavigate();

  const loadQuizzes = async () => {
    const { data } = await teacherApi.listQuizzes();
    setQuizzes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadQuizzes();
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          Object.values(e?.response?.data?.errors || {}).flat().join(" ") ||
          "Failed to load quizzes";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = quizzes.length;
    const published = quizzes.filter((q) => !!q.is_published).length;
    return { total, published };
  }, [quizzes]);

  const createQuiz = async () => {
    setErr("");
    if (!title.trim()) return setErr("Title is required.");
    if (Number(durationMinutes) <= 0) return setErr("Duration must be > 0.");

    setCreating(true);
    try {
      await teacherApi.createQuiz({
        title: title.trim(),
        duration_minutes: Number(durationMinutes),
        is_published: false,
      });

      setTitle("");
      setDurationMinutes(10);
      await loadQuizzes();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        Object.values(e?.response?.data?.errors || {}).flat().join(" ") ||
        "Failed to create quiz";
      setErr(msg);
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (q) => {
    setErr("");
    setTogglingId(q.id);
    try {
      await teacherApi.updateQuiz(q.id, { is_published: !q.is_published });
      await loadQuizzes();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update publish status");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: <b>{stats.total}</b> · Published: <b>{stats.published}</b>
          </p>
        </div>

        <button
          onClick={() => navigate("/teacher")}
          className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
        >
          Back to dashboard
        </button>
      </div>

      {err && (
        <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {err}
        </div>
      )}

      {/* Create quiz */}
      <div className="mt-6 border rounded-2xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold">Create a quiz</h2>
        <p className="text-sm text-gray-600 mt-1">
          Module/Group are taken automatically from your teacher account.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
              placeholder="Quiz ECO 1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={createQuiz}
              disabled={creating}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create quiz"}
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes list */}
      <div className="mt-6">
        {quizzes.length === 0 ? (
          <div className="text-gray-600">No quizzes yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <div key={q.id} className="border rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg">{q.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Duration: {q.duration_minutes} min
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Module ID: #{q.module_id} · Group ID: #{q.group_id}
                    </div>
                    <div className="text-sm mt-1">
                      Status:{" "}
                      <span className={q.is_published ? "text-green-700" : "text-gray-600"}>
                        {q.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePublish(q)}
                    disabled={togglingId === q.id}
                    className="px-3 py-2 rounded-md border hover:bg-gray-50 text-sm disabled:opacity-60"
                  >
                    {togglingId === q.id ? "..." : q.is_published ? "Unpublish" : "Publish"}
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.id}`)}
                  className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  Manage / Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}