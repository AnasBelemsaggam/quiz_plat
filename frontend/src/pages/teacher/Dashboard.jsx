import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // create quiz form
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [moduleId, setModuleId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [creating, setCreating] = useState(false);

  
  const [togglingId, setTogglingId] = useState(null);

  const stats = useMemo(() => {
    const total = quizzes.length;
    const published = quizzes.filter(
      (q) => Number(q.is_published) === 1 || q.is_published === true
    ).length;

    
    const questions = quizzes.reduce(
      (sum, q) => sum + (Array.isArray(q.questions) ? q.questions.length : 0),
      0
    );

    return { total, published, questions };
  }, [quizzes]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/teacher/quizzes");
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard stats");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createQuiz = async () => {
    setErr("");

    if (!title.trim()) return setErr("Title is required.");
    if (!moduleId || !groupId) return setErr("module_id and group_id are required.");
    if (Number(durationMinutes) <= 0) return setErr("Duration must be > 0.");

    setCreating(true);
    try {
      await api.post("/teacher/quizzes", {
        title: title.trim(),
        duration_minutes: Number(durationMinutes),
        module_id: Number(moduleId),
        group_id: Number(groupId),
      });

      setTitle("");
      setDurationMinutes(10);
      setModuleId("");
      setGroupId("");

      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (quiz) => {
    setErr("");
    setTogglingId(quiz.id);
    try {
      await api.put(`/teacher/quizzes/${quiz.id}`, {
        is_published: !quiz.is_published,
      });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const recentQuizzes = useMemo(() => {

    const copy = [...quizzes];
    copy.sort((a, b) => {
      const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    return copy.slice(0, 4);
  }, [quizzes]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create quizzes, add questions, and publish for your students.
          </p>
        </div>

        <Link
          to="/teacher/quizzes"
          className="inline-flex px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
        >
          Go to quizzes
        </Link>
      </div>

      {err && (
        <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {err}
        </div>
      )}

      {}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <div className="text-sm text-gray-500">Total quizzes</div>
          <div className="mt-2 text-3xl font-bold">{loading ? "…" : stats.total}</div>
        </div>

        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <div className="text-sm text-gray-500">Published quizzes</div>
          <div className="mt-2 text-3xl font-bold">{loading ? "…" : stats.published}</div>
        </div>

        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <div className="text-sm text-gray-500">Questions (if provided)</div>
          <div className="mt-2 text-3xl font-bold">{loading ? "…" : stats.questions}</div>
          <div className="mt-2 text-xs text-gray-500">
            For an exact count, open a quiz and view its questions.
          </div>
        </div>
      </div>

      {}
      <div className="mt-8 border rounded-2xl p-5 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Create a quiz</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill the IDs that exist in your database (module_id & group_id).
            </p>
          </div>

          <button
            onClick={() => navigate("/teacher/quizzes")}
            className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
          >
            Manage all
          </button>
        </div>

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

          <div>
            <label className="text-sm font-medium">module_id</label>
            <input
              type="number"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
              placeholder="3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">group_id</label>
            <input
              type="number"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
              placeholder="2"
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

      {}
      <div className="mt-8 grid lg:grid-cols-2 gap-4">
        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent quizzes</h2>
            <Link to="/teacher/quizzes" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 text-gray-600">Loading…</div>
          ) : recentQuizzes.length === 0 ? (
            <div className="mt-4 text-gray-600">No quizzes yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentQuizzes.map((q) => (
                <div key={q.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{q.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Duration: {q.duration_minutes} min ·{" "}
                        <span className={q.is_published ? "text-green-700" : "text-gray-700"}>
                          {q.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePublish(q)}
                      disabled={togglingId === q.id}
                      className="px-3 py-2 rounded-md border hover:bg-gray-50 text-sm disabled:opacity-60"
                      title="Toggle publish"
                    >
                      {togglingId === q.id
                        ? "..."
                        : q.is_published
                        ? "Unpublish"
                        : "Publish"}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/teacher/quizzes/${q.id}`)}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    >
                      Manage questions
                    </button>

                    <button
                      onClick={() => navigate("/teacher/quizzes")}
                      className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
                    >
                      Open list
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold">Quick actions</h2>

          <div className="mt-4 grid gap-3">
            <Link to="/teacher/quizzes" className="border rounded-xl p-4 hover:bg-gray-50">
              <div className="font-semibold">Manage quizzes</div>
              <div className="text-sm text-gray-600 mt-1">
                View quizzes, publish/unpublish, and open any quiz to add questions.
              </div>
            </Link>

            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="font-semibold">Add questions</div>
              <div className="text-sm text-gray-600 mt-1">
                Open a quiz, then use “Add a question” to create MCQ choices and select the correct one.
              </div>
            </div>

            <button
              onClick={load}
              className="border rounded-xl p-4 hover:bg-gray-50 text-left"
            >
              <div className="font-semibold">Refresh</div>
              <div className="text-sm text-gray-600 mt-1">
                Re-fetch quizzes and update dashboard stats.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}