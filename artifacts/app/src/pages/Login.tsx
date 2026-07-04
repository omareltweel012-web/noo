import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@workspace/api-client-react";
import Particles from "../components/Particles";
import PageTransition from "../components/PageTransition";
import { ShieldAlert, Clock, Ban, Lock } from "lucide-react";

const OWNER_EMAIL = "omareltweel012@gmail.com";
const POLL_INTERVAL = 2000;

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("deviceId");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("deviceId", id); }
  return id;
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setDisplayed(text.slice(0, ++i));
        if (i >= text.length) clearInterval(iv);
      }, 45);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{displayed}<span className="inline-block w-0.5 h-4 bg-yellow-400 ml-0.5 animate-[cursor-blink_1s_step-end_infinite]" /></span>;
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
    if (localStorage.getItem("sessionToken")) { setLocation("/dashboard"); return; }
    const stored = localStorage.getItem("userEmail");
    const devId = getOrCreateDeviceId();
    if (stored && stored.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      setEmail(stored);
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: stored, deviceId: devId }),
      })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d.sessionToken) { localStorage.setItem("sessionToken", d.sessionToken); setLocation("/dashboard"); }
          else if (d.error?.includes("محظور")) { setBanned(true); setPending(true); startPolling(stored); }
          else if (d.error?.includes("انتظار")) { setBanned(false); setPending(true); startPolling(stored); }
          else if (d.error?.includes("جهاز آخر")) { setErrorMsg(d.error); }
          else { setLockedEmail(stored); setDeviceLocked(true); }
        })
        .catch(() => { setLockedEmail(stored); setDeviceLocked(true); });
    }
  }, [setLocation]); // eslint-disable-line

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  const startPolling = (emailToTry: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const devId = getOrCreateDeviceId();
        const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: emailToTry, deviceId: devId }) });
        const d = await r.json();
        if (r.ok && d.sessionToken) { stopPolling(); localStorage.setItem("sessionToken", d.sessionToken); localStorage.setItem("userEmail", d.email); setLocation("/dashboard"); }
        else if (d.error?.includes("انتظار")) { setBanned(false); setPending(true); }
        else if (d.error?.includes("محظور")) { setBanned(true); setPending(true); }
      } catch {}
    }, POLL_INTERVAL);
  };
  useEffect(() => () => stopPolling(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setPending(false); setBanned(false);
    if (!email) return;
    const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const stored = localStorage.getItem("userEmail");
    if (!isOwner && stored && stored.toLowerCase() !== email.toLowerCase()) { setDeviceLocked(true); setLockedEmail(stored); return; }
    const deviceId = getOrCreateDeviceId();
    login.mutate({ data: { email, deviceId } }, {
      onSuccess: (res) => {
        stopPolling();
        if (res.sessionToken) { localStorage.setItem("sessionToken", res.sessionToken); localStorage.setItem("userEmail", res.email); setLocation("/dashboard"); }
      },
      onError: (err: any) => {
        const msg: string = err?.data?.error ?? err?.response?.data?.error ?? err?.message ?? "حدث خطأ";
        if (msg.includes("انتظار")) { setPending(true); setBanned(false); startPolling(email); }
        else if (msg.includes("محظور")) { setBanned(true); setPending(true); startPolling(email); }
        else setErrorMsg(msg);
      },
    });
  };

  const card = "relative bg-black/60 backdrop-blur-xl border rounded-2xl p-8 shadow-2xl";

  if (deviceLocked) return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex items-center justify-center p-4">
        <Particles />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className={`${card} border-yellow-500/30 w-full max-w-md z-10`}>
          <div className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center" style={{ boxShadow: "0 0 30px rgba(255,184,0,0.2)" }}>
              <Lock size={30} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">الجهاز مقيّد</h2>
            <p className="text-white/50 text-sm mb-3">هذا الجهاز مرتبط بالإيميل</p>
            <p className="font-mono text-sm text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg mb-4" dir="ltr">{lockedEmail}</p>
            <p className="text-white/30 text-xs">لا يمكن تسجيل الدخول بإيميل آخر على نفس الجهاز</p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );

  if (pending) return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex items-center justify-center p-4">
        <Particles />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className={`${card} ${banned ? "border-red-500/30" : "border-yellow-500/30"} w-full max-w-md z-10`}>
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border ${banned ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}
              style={{ boxShadow: banned ? "0 0 30px rgba(255,0,60,0.2)" : "0 0 30px rgba(255,184,0,0.2)" }}
            >
              {banned ? <Ban size={30} className="text-red-400" /> : <Clock size={30} className="text-yellow-400" />}
            </motion.div>
            {banned
              ? <><h2 className="text-2xl font-bold text-red-400 mb-3 glitch-text" data-text="الحساب موقوف">الحساب موقوف</h2><p className="text-white/50 text-sm mb-4">برجاء التواصل مع الدعم لتجديد اشتراك السيرفر.</p></>
              : <><h2 className="text-2xl font-bold text-yellow-400 mb-3">في انتظار الموافقة</h2><p className="text-white/50 text-sm mb-4">برجاء التواصل مع المطور لدفع اشتراك السيرفر.</p></>
            }
            <p className="text-white/25 text-xs mb-4 font-mono" dir="ltr">{email}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 0.2, 0.4].map((d) => (
                <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-white/30"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: d }} />
              ))}
              <span className="text-white/30 text-xs mr-1">جارٍ التحقق تلقائياً</span>
            </div>
            <button onClick={() => { stopPolling(); setPending(false); setBanned(false); setEmail(""); }} className="text-white/30 hover:text-white/60 text-sm transition-colors underline underline-offset-4">رجوع</button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex items-center justify-center p-4">
        <Particles />
        <div className="w-full max-w-md z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`${card} border-white/10`}
          >
            {/* Glow top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent rounded-t-2xl" />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
                <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center p-4"
                  style={{ boxShadow: "0 0 40px rgba(255,184,0,0.35), 0 0 80px rgba(255,184,0,0.15)" }}>
                  <ShieldAlert size={36} className="text-black" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-extrabold text-center text-white mb-2"
              style={{ textShadow: "0 0 20px rgba(255,184,0,0.3)" }}
            >
              <TypewriterText text="تسجيل الدخول" delay={300} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-white/30 text-sm text-center mb-8"
            >
              الوصول مقيّد — الهوية مطلوبة
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-xl bg-white/4 border-white/10 text-white text-right placeholder:text-white/25 px-5 text-base focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/40 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  dir="rtl"
                  required
                  data-testid="input-email"
                />
              </motion.div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-400 text-sm text-center bg-red-500/5 border border-red-500/15 rounded-lg py-2">
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-lg font-extrabold hover:from-yellow-400 hover:to-amber-400 transition-all duration-200 relative overflow-hidden"
                  style={{ boxShadow: "0 0 25px rgba(255,184,0,0.25), 0 4px 15px rgba(0,0,0,0.4)" }}
                  disabled={login.isPending}
                  data-testid="button-login"
                >
                  <span className="relative z-10">{login.isPending ? "جارٍ التحقق..." : "دخول"}</span>
                  {/* shimmer */}
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    animate={{ translateX: ["−100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* bottom hint */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="text-center text-white/15 text-xs mt-4">
            ⚠ المنصة محمية ومراقبة
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
