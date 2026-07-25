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
    const result = await supabase.rpc("update_all_forbid");
    console.log("update_all_forbid result:", result);

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
        <table className="w-full border border-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 border border-gray-700">Title</th>
              <th className="p-3 border border-gray-700">Symbol</th>
              <th className="p-3 border border-gray-700">Description</th>
              <th className="p-3 border border-gray-700">is_forbid</th>
              <th className="p-3 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-gray-800 transition-colors">
                <td className="p-3 border border-gray-700 font-bold text-base tracking-wide">
                  {r.title}
                </td>

                <td className="p-3 border border-gray-700 font-mono text-gray-300">
                  {r.sym}
                </td>

                <td className="p-3 border border-gray-700 text-gray-300">
                  {describeSym(r.sym)}
                </td>

                <td className="p-3 border border-gray-700">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r.is_forbid}
                      onChange={() => toggleForbid(r)}
                      className="sr-only peer"
                    />

                    {/* background */}
                    <div className="w-12 h-6 bg-gray-600 rounded-full peer-checked:bg-green-500 transition-colors duration-300 relative">
                      {/* ball */}
                      <div
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                      transition-transform duration-300
                      peer-checked:translate-x-[24px]"
                      ></div>
                    </div>
                  </label>
                </td>

                <td className="p-3 border border-gray-700">
                  <button
                    onClick={() => openEditModal(r)}
                    className="mr-2 px-3 py-1 text-xs bg-yellow-500 text-black rounded hover:bg-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRule(r.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-3 border border-gray-700 text-center text-gray-400"
                >
                  ยังไม่มีกฎ forbidshift
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
