"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ForbidShift = {
  id: number;
  title: string;
  sym: string;
  is_forbid: boolean;
};

const symMap: Record<string, string> = {
  ด: "ดึก",
  ช: "เช้า",
  บ: "บ่าย",
  พ: "พิเศษ",
  ย: "หยุด",
  อ: "ประชุม",
  c: "CVT",
  a: "AVF",
  u: "URO",
  f: "FX",
};

function describeSym(sym: string): string {
  if (!sym) return "";
  if (sym.includes("/")) {
    const [a, b] = sym.split("/");
    return `${symMap[a] ?? a} → ${symMap[b] ?? b}`;
  }
  if (sym.length === 2) {
    const [a, b] = sym.split("");
    return `${symMap[a] ?? a} → ${symMap[b] ?? b}`;
  }
  return symMap[sym] ?? sym;
}

export default function ForbidShiftPage() {
  const [rules, setRules] = useState<ForbidShift[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ForbidShift | null>(null);

  const [titleInput, setTitleInput] = useState("");
  const [symInput, setSymInput] = useState("");
  const [isForbidInput, setIsForbidInput] = useState(true);

  const loadRules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("forbidshift")
      .select("*")
      .order("id", { ascending: true });

    if (data) setRules(data as ForbidShift[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openNewModal = () => {
    setEditing(null);
    setTitleInput("");
    setSymInput("");
    setIsForbidInput(true);
    setShowModal(true);
  };

  const openEditModal = (rule: ForbidShift) => {
    setEditing(rule);
    setTitleInput(rule.title);
    setSymInput(rule.sym);
    setIsForbidInput(rule.is_forbid);
    setShowModal(true);
  };

  const saveRule = async () => {
    if (!titleInput.trim() || !symInput.trim()) return;

    if (editing) {
      await supabase
        .from("forbidshift")
        .update({
          title: titleInput.trim(),
          sym: symInput.trim(),
          is_forbid: isForbidInput,
        })
        .eq("id", editing.id);
    } else {
      await supabase.from("forbidshift").insert({
        title: titleInput.trim(),
        sym: symInput.trim(),
        is_forbid: isForbidInput,
      });
    }

    setShowModal(false);
    await loadRules();
  };

  const deleteRule = async (id: number) => {
    if (!confirm("ลบกฎนี้จริงไหม?")) return;
    await supabase.from("forbidshift").delete().eq("id", id);
    await loadRules();
  };

  const toggleForbid = async (rule: ForbidShift) => {
    // update UI ทันที
    setRules((prev) =>
      prev.map((item) =>
        item.id === rule.id ? { ...item, is_forbid: !rule.is_forbid } : item,
      ),
    );

    // update DB
    await supabase
      .from("forbidshift")
      .update({ is_forbid: !rule.is_forbid })
      .eq("id", rule.id);

    // 🔥 เรียกฟังก์ชัน update_all_forbid() หลังแก้กฎ
    await supabase.rpc("update_all_forbid");

    // ไม่ต้อง loadRules() เพื่อไม่ให้ switch กระพริบ
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-wide">
          Forbid Shift Setting
        </h1>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          + Add Rule
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border border-gray-700 text-xs sm:text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 border border-gray-700 w-36 sm:w-auto">
                  Title
                </th>
                <th className="p-2 border border-gray-700 w-10 sm:w-auto">
                  is_forbid
                </th>
                <th className="p-2 border border-gray-700 w-10 sm:w-auto">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800 transition-colors">
                  {/* Title */}
                  <td className="p-2 border border-gray-700 font-semibold">
                    {r.title}
                  </td>

                  {/* Switch (compact) */}
                  <td className="p-2 border border-gray-700 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.is_forbid}
                        onChange={() => toggleForbid(r)}
                        className="sr-only peer"
                      />

                      <div className="w-10 h-5 bg-gray-600 rounded-full peer-checked:bg-green-500 transition-colors duration-300 relative">
                        <div
                          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                  transition-transform duration-300
                  peer-checked:translate-x-[20px]"
                        ></div>
                      </div>
                    </label>
                  </td>

                  {/* Actions (compact icons) */}
                  <td className="p-2 border border-gray-700 text-center w-20">
                    <div className="flex items-center justify-center space-x-1">
                      {/* Edit icon */}
                      <button
                        onClick={() => openEditModal(r)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5h2m-1 0v14m-7-7h14"
                          />
                        </svg>
                      </button>

                      {/* Delete icon */}
                      <button
                        onClick={() => deleteRule(r.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rules.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-3 border border-gray-700 text-center text-gray-400"
                  >
                    ยังไม่มีกฎ forbidshift
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow w-96 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Forbid Rule" : "Add Forbid Rule"}
            </h2>

            <label className="block mb-2 text-sm">Title</label>
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-white p-2 w-full mb-4 rounded"
              placeholder='เช่น "เวรดึกต่อเช้า"'
            />

            <label className="block mb-2 text-sm">Symbol</label>
            <input
              value={symInput}
              onChange={(e) => setSymInput(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-white p-2 w-full mb-4 rounded"
              placeholder='เช่น "ด/ช", "พบ", "c/ด"'
            />

            <label className="flex items-center mb-4 text-sm">
              <input
                type="checkbox"
                checked={isForbidInput}
                onChange={(e) => setIsForbidInput(e.target.checked)}
                className="mr-2"
              />
              is_forbid
            </label>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveRule}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500"
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
