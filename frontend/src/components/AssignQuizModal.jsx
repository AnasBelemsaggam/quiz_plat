import { useEffect, useState } from "react";
import { teacherApi } from "../lib/teacherApi";

export default function AssignQuizModal({ quiz, onClose }) {
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  const [moduleId, setModuleId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [studentId, setStudentId] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teacherApi.listModules().then(r => setModules(r.data || []));
    teacherApi.listStudents().then(r => setStudents(r.data || []));
  }, []);

  useEffect(() => {
    setGroupId("");
    if (!moduleId) return setGroups([]);
    teacherApi.listGroupsByModule(moduleId).then(r => setGroups(r.data || []));
  }, [moduleId]);

  const assign = async () => {
    setMsg("");
    if (!moduleId && !studentId)
      return setMsg("Select module/group OR student");

    setSaving(true);
    try {
      await teacherApi.assignQuiz(quiz.id, {
        module_id: moduleId || null,
        group_id: groupId || null,
        student_id: studentId || null,
      });
      setMsg("Assigned successfully ");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Assignment failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          Assign quiz: {quiz.title}
        </h2>

        {msg && <div className="mb-3 text-sm">{msg}</div>}

        {/* Assign to module/group */}
        <div className="space-y-3">
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select module</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={!moduleId}
            className="w-full border rounded p-2"
          >
            <option value="">Select group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="my-4 text-center text-sm text-gray-500">OR</div>

        {/* Assign to student */}
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">Assign to specific student</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (#{s.id})
            </option>
          ))}
        </select>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
          <button
            onClick={assign}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}