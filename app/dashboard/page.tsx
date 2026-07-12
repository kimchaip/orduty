"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";

type StaffEditForm = {
  name: string;
  full_name: string;
  system_role: string;
  position1: string;
  position2: string;
  is_active: boolean;
  email: string;
  line_id: string;
  main: string;
  extend: string;
  extra: string;
  oncall_main: string;
  oncall_extend: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<StaffEditForm>({
    name: "",
    full_name: "",
    system_role: "",
    position1: "",
    position2: "",
    is_active: true,
    email: "",
    line_id: "",
    main: "[]",
    extend: "[]",
    extra: "[]",
    oncall_main: "[]",
    oncall_extend: "[]",
  });

  const MAIN_OPTIONS = ["ด", "ช", "บ"];
  const EXTEND_OPTIONS = ["cvt", "avf", "uro", "fx"];
  const EXTRA_OPTIONS = ["leader", "preop", "ortho"];

  function safeArray(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function openEditModal(staffItem: any) {
    setEditingStaff(staffItem);

    setEditForm({
      name: staffItem.name ?? "",
      full_name: staffItem.full_name ?? "",
      system_role: staffItem.system_role ?? "staff",
      position1: staffItem.position1 && staffItem.position1.trim() !== "" ? staffItem.position1 : "RN",
      position2: staffItem.position2 && staffItem.position2.trim() !== "" ? staffItem.position2 : "ชำนาญการ",
      is_active: staffItem.is_active ?? true,
      email: staffItem.email ?? "",
      line_id: staffItem.line_id ?? "",
      main: JSON.stringify(staffItem.main ?? []),
      extend: JSON.stringify(staffItem.extend ?? []),
      extra: JSON.stringify(staffItem.extra ?? []),
      oncall_main: JSON.stringify(staffItem.oncall_main ?? []),
      oncall_extend: JSON.stringify(staffItem.oncall_extend ?? []),
    });
  }

  async function saveStaffEdit() {
    if (!editingStaff) return;

    let main, extend, extra, oncall_main, oncall_extend;

    try {
      main = JSON.parse(editForm.main);
      extend = JSON.parse(editForm.extend);
      extra = JSON.parse(editForm.extra);
      oncall_main = JSON.parse(editForm.oncall_main);
      oncall_extend = JSON.parse(editForm.oncall_extend);
    } catch (err) {
      alert("❌ JSON format ผิด กรุณาแก้ไขให้ถูกต้องก่อนบันทึก");
      return;
    }

    const payload = {
      name: editForm.name,
      full_name: editForm.full_name,
      system_role: editForm.system_role,
      position1: editForm.position1,
      position2: editForm.position2,
      is_active: editForm.is_active,
      email: editForm.email,
      line_id: editForm.line_id,
      main,
      extend,
      extra,
      oncall_main,
      oncall_extend,
    };

    const { error } = await supabase
      .from("staff")
      .update(payload)
      .eq("id", editingStaff.id);

    if (!error) {
      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .order("full_name");

      setStaff(staffData ?? []);
      setEditingStaff(null);
    }
  }

  useEffect(() => {
    async function load() {
      // ⭐ รอ Supabase restore session จาก localStorage
      const { data } = await supabase.auth.getSession();
      const s = data.session;

      if (!s) {
        router.push("/login");
        return;
      }

      setSession(s);

      // decode role
      const decoded: any = jwtDecode(s.access_token);
      const userRole = decoded.app_role ?? "authenticated";
      setRole(userRole);

      if (userRole !== "admin") {
        router.push("/staff");
        return;
      }

      // ⭐ ตอนนี้ session พร้อมแล้ว → query staff
      const { data: staffData, error } = await supabase
        .from("staff")
        .select("*")
        .order("full_name");

      if (!error) {
        setStaff(staffData);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 relative">
      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 flex gap-3">
        {/* Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow"
        >
          Logout
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto bg-gray-800/80 border border-gray-700 shadow-lg rounded-2xl p-6 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-4 text-gray-100">
          Dashboard (Admin)
        </h1>

        <div className="mb-6 text-gray-300 space-y-1">
          <p>
            <strong className="text-gray-200">Email:</strong>{" "}
            {session?.user.email}
          </p>
          <p>
            <strong className="text-gray-200">Role:</strong> {role}
          </p>
        </div>

        {/* Staff List */}
        <div className="bg-gray-700/50 border border-gray-600 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-gray-100">Staff List</h2>

          <ul className="space-y-2">
            {staff.map((s) => (
              <li
                key={s.id}
                className="p-3 bg-gray-700 rounded border border-gray-600 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold text-gray-100">
                    {s.full_name}
                  </span>
                  <span className="text-gray-400"> — {s.system_role}</span>
                </div>

                <button
                  onClick={() => openEditModal(s)}
                  className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Edit Staff
            </h2>

            <div className="space-y-4">
              {/* name */}
              <div>
                <label className="text-gray-300">Name</label>
                <input
                  type="text"
                  value={String(editForm.name ?? "")}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                />
              </div>

              {/* full_name */}
              <div>
                <label className="text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={String(editForm.full_name ?? "")}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                />
              </div>

              {/* system_role */}
              <div>
                <label className="text-gray-300">System Role</label>
                <select
                  value={String(editForm.system_role ?? "")}
                  onChange={(e) =>
                    setEditForm({ ...editForm, system_role: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                >
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
              </div>

              {/* position1 */}
              <div>
                <label className="text-gray-300">Position 1</label>
                <select
                  value={editForm.position1 && editForm.position1.trim() !== "" ? editForm.position1 : "RN"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, position1: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                >
                  <option value="RN">RN</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              {/* position2 */}
              <div>
                <label className="text-gray-300">Position 2</label>
                <select
                  value={editForm.position2 && editForm.position2.trim() !== "" ? editForm.position2 : "ชำนาญการ"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, position2: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                >
                  <option value="ชำนาญการพิเศษ">ชำนาญการพิเศษ</option>
                  <option value="ชำนาญการ">ชำนาญการ</option>
                  <option value="ปฎิบัติการ">ปฎิบัติการ</option>
                  <option value="ลูกจ้างชั่วคราว">ลูกจ้างชั่วคราว</option>
                  <option value="ประจำ">ประจำ</option>
                  <option value="พกส">พกส</option>
                </select>
              </div>

              {/* is_active */}
              <div className="flex items-center gap-3">
                <label className="text-gray-300">Active</label>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </div>

              {/* email */}
              <div>
                <label className="text-gray-300">Email</label>
                <input
                  type="text"
                  placeholder="Email"
                  value={String(editForm.email ?? "")}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                />
              </div>

              {/* line_id */}
              <div>
                <label className="text-gray-300">Line ID</label>
                <input
                  type="text"
                  placeholder="Line ID"
                  value={String(editForm.line_id ?? "")}
                  onChange={(e) =>
                    setEditForm({ ...editForm, line_id: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-100"
                />
              </div>

              {/* ⭐ main */}
              <div>
                <label className="text-gray-300">main</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {MAIN_OPTIONS.map((opt) => {
                    const arr = safeArray(editForm.main);
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={arr.includes(opt)}
                          onChange={(e) => {
                            let newArr = [...arr];
                            if (e.target.checked) newArr.push(opt);
                            else newArr = newArr.filter((x) => x !== opt);
                            setEditForm({
                              ...editForm,
                              main: JSON.stringify(newArr),
                            });
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ⭐ extend */}
              <div>
                <label className="text-gray-300">extend</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {EXTEND_OPTIONS.map((opt) => {
                    const arr = safeArray(editForm.extend);
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={arr.includes(opt)}
                          onChange={(e) => {
                            let newArr = [...arr];
                            if (e.target.checked) newArr.push(opt);
                            else newArr = newArr.filter((x) => x !== opt);
                            setEditForm({
                              ...editForm,
                              extend: JSON.stringify(newArr),
                            });
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ⭐ extra */}
              <div>
                <label className="text-gray-300">extra</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {EXTRA_OPTIONS.map((opt) => {
                    const arr = safeArray(editForm.extra);

                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={arr.includes(opt)}
                          onChange={(e) => {
                            let newArr = [...arr];
                            if (e.target.checked) newArr.push(opt);
                            else newArr = newArr.filter((x) => x !== opt);

                            setEditForm({
                              ...editForm,
                              extra: JSON.stringify(newArr),
                            });
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ⭐ oncall_main */}
              <div>
                <label className="text-gray-300">oncall_main</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {MAIN_OPTIONS.map((opt) => {
                    const arr = safeArray(editForm.oncall_main);
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={arr.includes(opt)}
                          onChange={(e) => {
                            let newArr = [...arr];
                            if (e.target.checked) newArr.push(opt);
                            else newArr = newArr.filter((x) => x !== opt);
                            setEditForm({
                              ...editForm,
                              oncall_main: JSON.stringify(newArr),
                            });
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ⭐ oncall_extend */}
              <div>
                <label className="text-gray-300">oncall_extend</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {EXTEND_OPTIONS.map((opt) => {
                    const arr = safeArray(editForm.oncall_extend);
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={arr.includes(opt)}
                          onChange={(e) => {
                            let newArr = [...arr];
                            if (e.target.checked) newArr.push(opt);
                            else newArr = newArr.filter((x) => x !== opt);
                            setEditForm({
                              ...editForm,
                              oncall_extend: JSON.stringify(newArr),
                            });
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={saveStaffEdit}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
