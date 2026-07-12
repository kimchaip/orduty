"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LoginPage from "./login/page";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);

      // ถ้า login แล้ว → ไป dashboard
      if (data.user) {
        router.push("/dashboard");
      }
    }

    checkUser();
  }, []);

  // ระหว่างโหลด user
  if (loading) {
    return (
      <div className="text-white p-6">
        Loading...
      </div>
    );
  }

  // ถ้ายังไม่ login → แสดงหน้า Login เดิม
  if (!user) {
    return <LoginPage />;
  }

  // ถ้า login แล้ว → redirect ไป dashboard (จะไม่เห็นหน้านี้)
  return null;
}
