"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LoginPage from "./login/page";
import type { Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      setSession(currentSession);
      setLoading(false);

      if (!currentSession) return;

      // อ่าน role จาก session
      const decoded: any = jwtDecode(currentSession.access_token);
      const userRole = decoded.app_role ?? "authenticated";

      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "staff") {
        router.push("/staff");
      } else {
        await supabase.auth.signOut();
        router.push("/login");
      }
    }

    checkSession();
  }, []);

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return null;
}
