"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import type { Session } from "@supabase/supabase-js";

export default function StaffPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [staff, setStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const s = data.session;

      if (!s) {
        router.push("/login");
        return;
      }

      setSession(s);

      const decoded: any = jwtDecode(s.access_token);
      const userRole = decoded.app_role ?? "authenticated";
      setRole(userRole);

      if (userRole === "admin") {
        router.push("/dashboard");
        return;
      }

      const { data: staffData, error } = await supabase
        .from("staff")
        .select("*")
        .eq("auth_id", s.user.id)
        .single();

      if (!error) {
        setStaff(staffData);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="p-6 text-gray-300">Loading...</p>;

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-100 p-6">

      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 flex gap-3">

        {/* Debug JWT */}
        <button
          onClick={async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              console.log("Decoded JWT:", jwtDecode(data.session.access_token));
              alert(JSON.stringify(jwtDecode(data.session.access_token), null, 2));
            } else {
              console.log("Session is null");
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Debug JWT
        </button>

        {/* Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition"
        >
          Logout
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto bg-gray-800/80 border border-gray-700 shadow-lg rounded-2xl p-6 backdrop-blur-sm">

        <h1 className="text-3xl font-bold mb-4 text-gray-100">
          Staff Profile
        </h1>

        <div className="mb-4 text-gray-300 space-y-1">
          <p>
            <strong className="text-gray-200">Email:</strong> {session?.user.email}
          </p>
          <p>
            <strong className="text-gray-200">Role:</strong> {role}
          </p>
        </div>

        {/* Staff Info */}
        {staff ? (
          <div className="border border-gray-700 p-4 rounded-lg bg-gray-700/50 text-gray-200 mt-4 space-y-1">
            <p>
              <strong className="text-gray-100">Full Name:</strong> {staff.full_name}
            </p>
            <p>
              <strong className="text-gray-100">Position:</strong> {staff.position}
            </p>
            <p>
              <strong className="text-gray-100">System Role:</strong>{" "}
              <span className="text-blue-400 font-semibold">{staff.system_role}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-400 mt-4">No staff record found.</p>
        )}
      </div>
    </div>
  );
}
