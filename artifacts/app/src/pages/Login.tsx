import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@workspace/api-client-react";
import Particles from "../components/Particles";
import { Key } from "lucide-react";
import AdminPanel from "../components/AdminPanel";

export default function Login() {
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const login = useLogin();

  useEffect(() => {
    if (localStorage.getItem("sessionToken")) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    login.mutate(
      { data: { email } },
      {
        onSuccess: (res) => {
          if (res.sessionToken) {
            localStorage.setItem("sessionToken", res.sessionToken);
            setLocation("/dashboard");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
      <Particles />
      <AdminPanel />

      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,184,0,0.3)]">
              <Key size={32} className="text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-8">تسجيل الدخول</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-xl bg-black/40 border-white/10 text-white text-right placeholder:text-white/30 px-6 text-lg focus-visible:ring-yellow-500"
                dir="rtl"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-[0_0_20px_rgba(255,184,0,0.2)]"
              disabled={login.isPending}
            >
              {login.isPending ? "جاري التسجيل..." : "دخول"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}