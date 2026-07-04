import { motion } from "framer-motion";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import PageTransition from "../components/PageTransition";
import { Landmark, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const stagger = { animate: { transition: { staggerChildren: 0.09 } } };
const row = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const FIELDS = [
  { placeholder: "الاسم", dir: "rtl" as const },
  { placeholder: "الرصيد", dir: "rtl" as const },
  { placeholder: "رقم التحويل", dir: "rtl" as const },
  { placeholder: "الضريبة", dir: "rtl" as const },
  { placeholder: "رقم المستخدم", dir: "rtl" as const },
];

export default function Tax() {
  return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex flex-col items-center pt-6 px-4 pb-24 relative">
        <Particles />
        <AdminPanel />

        {/* header */}
        <div className="z-10 w-full max-w-md flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Landmark size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/30">الخدمة</p>
              <p className="text-white font-bold text-sm">الضريبة</p>
            </div>
          </div>
          <Link href="/dashboard">
            <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.93 }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors">
              <ChevronRight size={20} />
            </motion.div>
          </Link>
        </div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="z-10 w-full max-w-md">

          {/* icon + title */}
          <motion.div variants={row} className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl scale-110" />
              <div className="relative w-20 h-20 rounded-[20px] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"
                style={{ boxShadow: "0 0 50px rgba(239,68,68,0.35), 0 0 100px rgba(239,68,68,0.12)" }}>
                <Landmark size={38} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1" style={{ textShadow: "0 0 20px rgba(239,68,68,0.25)" }}>
              الضريبة
            </h1>
            <p className="text-white/30 text-sm flex items-center gap-1"><Zap size={12} className="text-red-400" />أدخل البيانات بدقة</p>
          </motion.div>

          <div className="space-y-4 mb-8">
            {FIELDS.map((f, i) => (
              <motion.div key={i} variants={row}>
                <Input
                  type="text"
                  placeholder={f.placeholder}
                  dir={f.dir}
                  className="h-14 rounded-xl bg-white/3 border-white/10 text-white text-right px-5 text-base focus-visible:ring-red-500/40 focus-visible:border-red-500/30 transition-all placeholder:text-white/20"
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={row}>
            <Button
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-lg font-extrabold hover:from-yellow-400 hover:to-amber-400 transition-all"
              style={{ boxShadow: "0 0 25px rgba(255,184,0,0.25)" }}
            >
              تسجيل
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
