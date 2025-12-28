import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
    // create form
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState("student");
  const [cModuleId, setCModuleId] = useState("");
  const [cGroupId, setCGroupId] = useState("");
  const [creating, setCreating] = useState(false);

  // edit form
  const [editing, setEditing] = useState(null); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [moduleId, setModuleId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [password, setPassword] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
    const createUser = async () => {
    setErr("");
    if (!cName.trim()) return setErr("Name is required");
    if (!cEmail.trim()) return setErr("Email is required");
    if (!cPassword.trim()) return setErr("Password is required");

    setCreating(true);
    try {
      await adminApi.createUser({
        name: cName.trim(),
        email: cEmail.trim(),
        password: cPassword.trim(),
        role: cRole,
        module_id: cModuleId === "" ? null : Number(cModuleId),
        group_id: cGroupId === "" ? null : Number(cGroupId),
      });

      // reset
      setCName("");
      setCEmail("");
      setCPassword("");
      setCRole("student");
      setCModuleId("");
      setCGroupId("");

      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        Object.values(e?.response?.data?.errors || {}).flat().join(" ") ||
        "Failed to create user";
      setErr(msg);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (u) => {
    setEditing(u);
    setName(u.name || "");
    setEmail(u.email || "");
    setRole(u.role || "student");
    setModuleId(u.module_id ?? "");
    setGroupId(u.group_id ?? "");
    setPassword("");
  };

  const save = async () => {
    setErr("");
    if (!editing) return;

    try {
      await adminApi.updateUser(editing.id, {
        name,
        email,
        role,
        module_id: moduleId === "" ? null : Number(moduleId),
        group_id: groupId === "" ? null : Number(groupId),
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      setEditing(null);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        Object.values(e?.response?.data?.errors || {}).flat().join(" ") ||
        "Failed to update user";
      setErr(msg);
    }
  };

  const del = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    setErr("");
    try {
      await adminApi.deleteUser(u.id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Admin</h1>

      {err && (
        <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {err}
        </div>
      )}

      <div className="mt-6 border rounded-xl bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Module</th>
              <th className="p-3">Group</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.module_id ?? "-"}</td>
                <td className="p-3">{u.group_id ?? "-"}</td>
                <td className="p-3 flex gap-2 justify-end">
                  <button
                    onClick={() => startEdit(u)}
                    className="px-3 py-1.5 rounded border hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => del(u)}
                    className="px-3 py-1.5 rounded border text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={7}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
            {/* Create user */}
      <div className="mt-6 border rounded-2xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold">Create user</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full border rounded-lg p-3"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full border rounded-lg p-3"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              placeholder="user@test.com"
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full border rounded-lg p-3"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              placeholder="******"
              type="password"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              className="mt-1 w-full border rounded-lg p-3"
              value={cRole}
              onChange={(e) => setCRole(e.target.value)}
            >
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">module_id (optional)</label>
            <input
              className="mt-1 w-full border rounded-lg p-3"
              value={cModuleId}
              onChange={(e) => setCModuleId(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">group_id (optional)</label>
            <input
              className="mt-1 w-full border rounded-lg p-3"
              value={cGroupId}
              onChange={(e) => setCGroupId(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={createUser}
              disabled={creating}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create user"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">Edit user #{editing.id}</div>
              <button onClick={() => setEditing(null)} className="text-sm">
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input className="mt-1 w-full border rounded-lg p-3" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1 w-full border rounded-lg p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select className="mt-1 w-full border rounded-lg p-3" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">New password (optional)</label>
                  <input className="mt-1 w-full border rounded-lg p-3" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">module_id</label>
                  <input className="mt-1 w-full border rounded-lg p-3" value={moduleId} onChange={(e) => setModuleId(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">group_id</label>
                  <input className="mt-1 w-full border rounded-lg p-3" value={groupId} onChange={(e) => setGroupId(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}