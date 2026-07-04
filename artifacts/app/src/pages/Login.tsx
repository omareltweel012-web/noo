import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@workspace/api-client-react";
import Particles from "../components/Particles";
import { Key, Clock, Ban } from "lucide-react";

const OWNER_EMAIL = "omareltweel012@gmail.com";
const POLL_INTERVAL = 5000;

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
  const [banned, setBanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");
  const [, setLocation] = useLocation();
  const login = useLogin();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (localStorage.getItem("sessionToken")) {
      setLocation("/dashboard");
      return;
    }
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      setLockedEmail(storedEmail);
      setDeviceLocked(true);
    }
    getOrCreateDeviceId();
  }, [setLocation]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const tryLogin = (emailToTry: string) => {
    return new Promise<void>((resolve) => {
      login.mutate(
        { data: { email: emailToTry } },
        {
          onSuccess: (res) => {
            stopPolling();
            if (res.sessionToken) {
              localStorage.setItem("sessionToken", res.sessionToken);
              localStorage.setItem("userEmail", res.email);
              setLocation("/dashboard");
            }
            resolve();
          },
          onError: (err: any) => {
            const msg: string =
              err?.data?.error ??
              err?.response?.data?.error ??
              err?.message ??
              "";
            if (msg.includes("انتظار")) {
              setPending(true);
              setBanned(false);
            } else if (msg.includes("محظور")) {
              setBanned(true);
              setPending(true);
            }
            resolve();
          },
        }
      );
    });
  };

  const startPolling = (emailToTry: string) => {
    stopPolling();
    pollRef.current = setInterval(() => {
      tryLogin(emailToTry);
    }, POLL_INTERVAL);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setPending(false);
    setBanned(false);
    if (!email) return;

    const isOwnerLogin = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const storedEmail = localStorage.getItem("userEmail");
    if (!isOwnerLogin && storedEmail && storedEmail.toLowerCase() !== email.toLowerCase()) {
      setDeviceLocked(true);
      setLockedEmail(storedEmail);
      return;
    }

    login.mutate(
      { data: { email } },
      {
        onSuccess: (res) => {
          stopPolling();
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
            setBanned(false);
            startPolling(email);
          } else if (msg.includes("محظور")) {
            setBanned(true);
            setPending(true);
            startPolling(email);
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

  // ── Pending / Banned screen ──
  if (pending) {
    const isBannedScreen = banned;
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
        <Particles />
        <div className="w-full max-w-md z-10 relative">
          <div className={`bg-white/5 backdrop-blur-md border p-8 rounded-3xl shadow-2xl text-center ${isBannedScreen ? "border-red-500/20" : "border-yellow-500/20"}`}>
            <div className="flex justify-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isBannedScreen ? "bg-gradient-to-br from-red-500/20 to-red-700/20" : "bg-gradient-to-br from-yellow-500/20 to-yellow-700/20"}`}>
                {isBannedScreen
                  ? <Ban size={32} className="text-red-400" />
                  : <Clock size={32} className="text-yellow-400" />}
              </div>
            </div>

            {isBannedScreen ? (
              <>
                <h2 className="text-2xl font-bold text-red-400 mb-3">تم رفع طلبك</h2>
                <p className="text-white/60 text-sm mb-4">
                  تم رفض طلبك من قِبل المشرف. يتم التحقق تلقائياً كل 5 ثوانٍ في حال تغيّر القرار.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-400 mb-3">في انتظار الموافقة</h2>
                <p className="text-white/60 text-sm mb-4">
                  تم إرسال طلبك بنجاح. سيتم مراجعته من قِبل المشرف وستدخل تلقائياً عند الموافقة.
                </p>
              </>
            )}

            <p className="text-white/30 text-xs mb-2" dir="ltr">{email}</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
              <p className="text-white/30 text-xs">جارٍ التحقق تلقائياً...</p>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
            </div>

            <Button
              onClick={() => {
                stopPolling();
                setPending(false);
                setBanned(false);
                setEmail("");
              }}
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
