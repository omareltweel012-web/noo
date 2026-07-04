import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@workspace/api-client-react";
import Particles from "../components/Particles";
import { Key, Clock } from "lucide-react";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");
  const [, setLocation] = useLocation();
  const login = useLogin();

  useEffect(() => {
    if (localStorage.getItem("sessionToken")) {
      setLocation("/dashboard");
      return;
    }
    // Device lock check
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setLockedEmail(storedEmail);
      setDeviceLocked(true);
    }
    getOrCreateDeviceId();
  }, [setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setPending(false);
    if (!email) return;

    // Device lock: if this device was already used with another email, block
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail.toLowerCase() !== email.toLowerCase()) {
      setDeviceLocked(true);
      setLockedEmail(storedEmail);
      return;
    }

    login.mutate(
      { data: { email } },
      {
        onSuccess: (res) => {
          if (res.sessionToken) {
            localStorage.setItem("sessionToken", res.sessionToken);
            localStorage.setItem("userEmail", res.email);
            setLocation("/dashboard");
          }
        },
        onError: (err: any) => {
          const msg: string =
            err?.data?.error ??
            err?.response?.data?.error ??
            err?.message ??
            "حدث خطأ، حاول مرة أخرى";
          if (msg.includes("انتظار")) {
            setPending(true);
          } else {
            setErrorMsg(msg);
          }
        },
      }
    );
  };

  // ── Device locked screen ──
  if (deviceLocked) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
        <Particles />
        <div className="w-full max-w-md z-10 relative">
          <div className="bg-white/5 backdrop-blur-md border border-yellow-500/20 p-8 rounded-3xl shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 flex items-center justify-center">
                <Key size={32} className="text-yellow-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">هذا الجهاز مرتبط بإيميل آخر</h2>
            <p className="text-white/60 text-sm mb-2">هذا الجهاز مسجّل بالفعل بالإيميل:</p>
            <p className="text-white font-mono text-sm mb-6 bg-white/5 px-4 py-2 rounded-xl" dir="ltr">
              {lockedEmail}
            </p>
            <p className="text-white/40 text-xs">
              لا يمكن استخدام إيميل آخر على نفس الجهاز
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending approval screen ──
  if (pending) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
        <Particles />
        <div className="w-full max-w-md z-10 relative">
          <div className="bg-white/5 backdrop-blur-md border border-yellow-500/20 p-8 rounded-3xl shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 flex items-center justify-center">
                <Clock size={32} className="text-yellow-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-3">في انتظار الموافقة</h2>
            <p className="text-white/60 text-sm mb-4">
              تم إرسال طلبك بنجاح. سيتم مراجعته من قِبل المشرف وستتمكن من الدخول بعد الموافقة.
            </p>
            <p className="text-white/30 text-xs mb-6" dir="ltr">{email}</p>
            <Button
              onClick={() => { setPending(false); setEmail(""); }}
              variant="outline"
              className="border-white/10 text-white/50 hover:text-white text-sm"
            >
              رجوع
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main login screen ──
  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
      <Particles />

      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,184,0,0.3)]">
              <Key size={32} className="text-black" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-8">تسجيل الدخول</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl bg-black/40 border-white/10 text-white text-right placeholder:text-white/30 px-6 text-lg focus-visible:ring-yellow-500"
              dir="rtl"
              required
              data-testid="input-email"
            />

            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-[0_0_20px_rgba(255,184,0,0.2)]"
              disabled={login.isPending}
              data-testid="button-login"
            >
              {login.isPending ? "جاري الإرسال..." : "دخول"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
