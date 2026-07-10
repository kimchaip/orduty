"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("Signup succeeded but no user returned");
      return;
    }

    // ⭐ ดึงชื่อจาก email ก่อน @
    const emailName = user.email?.split("@")[0] ?? "";

    // Insert staff record อัตโนมัติ
    const { error: staffError } = await supabase.from("staff").insert({
      auth_id: user.id, // ⭐ เก็บ user_id เข้า staff.auth_id
      name: emailName, // ⭐ ชื่อย่อชั่วคราว
      full_name: emailName, // ⭐ ชื่อเต็มชั่วคราว
      email: user.email, // ⭐ เก็บ email จาก auth
      system_role: "staff",
      position1: "",
      position2: "",
      is_active: true,
      line_id: "",
      main: [],
      extend: [],
      extra: [],
      oncall_main: [],
      oncall_extend: [],
    });

    if (staffError) {
      alert("Signup OK แต่ insert staff พัง: " + staffError.message);
      return;
    }

    alert("Signup สำเร็จ! พร้อมใช้งานแล้ว");
    router.push("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition"
      >
        Logout
      </button>

      <div className="bg-gray-800/80 border border-gray-700 shadow-lg rounded-2xl p-8 w-full max-w-md backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
          เข้าสู่ระบบ ORDuty
        </h1>

        <form className="space-y-5">
          <input
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button" //
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
            onClick={handleLogin}
          >
            Login
          </button>

          <button
            type="button" //
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition"
            onClick={handleSignup}
          >
            Signup
          </button>

          {message && (
            <p className="mt-4 text-red-400 text-center font-medium">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
