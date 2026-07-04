import { useState } from "react";
import { motion } from "framer-motion";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import PageTransition from "../components/PageTransition";
import { Receipt, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const row = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function Transfer() {
  const [paymentMethod, setPaymentMethod] = useState("instapay");

  return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex flex-col items-center pt-6 px-4 pb-24 relative">
        <Particles />
        <AdminPanel />

        {/* header */}
        <div className="z-10 w-full max-w-md flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Receipt size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-white/30">الخدمة</p>
              <p className="text-white font-bold text-sm">ايصالات التحويل</p>
            </div>
          </div>
          <Link href="/dashboard">
            <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.93 }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors">
              <ChevronRight size={20} />
            </motion.div>
          </Link>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="z-10 w-full max-w-md"
        >
          {/* title */}
          <motion.div variants={row} className="mb-6">
            <h1 className="text-3xl font-extrabold text-white mb-1"
              style={{ textShadow: "0 0 20px rgba(255,184,0,0.2)" }}>
              ايصالات التحويل
            </h1>
            <p className="text-white/35 text-sm flex items-center gap-1"><Zap size={12} className="text-yellow-500" />أدخل بيانات التحويل بدقة</p>
          </motion.div>

          {/* example box */}
          <motion.div variants={row}
            className="w-full bg-yellow-500/6 border border-yellow-500/15 rounded-xl p-3 mb-6 text-center">
            <p className="text-yellow-500/70 text-sm font-mono">مثال: احمد محمد — 01012345678 — 500</p>
          </motion.div>

          <div className="space-y-4 mb-6">
            <motion.div variants={row} className="space-y-1.5">
              <label className="text-xs text-white/40 px-1">الاسم</label>
              <Input type="text" placeholder="الاسم الثلاثي"
                className="h-14 rounded-xl bg-white/3 border-white/10 text-white text-right px-5 text-base focus-visible:ring-yellow-500/40 focus-visible:border-yellow-500/30 transition-all placeholder:text-white/20"
                dir="rtl" />
            </motion.div>

            <motion.div variants={row} className="space-y-1.5">
              <label className="text-xs text-white/40 px-1">الرقم</label>
              <Input type="tel" placeholder="رقم الهاتف"
                className="h-14 rounded-xl bg-white/3 border-white/10 text-white text-right px-5 text-base focus-visible:ring-yellow-500/40 focus-visible:border-yellow-500/30 transition-all placeholder:text-white/20"
                dir="ltr" />
            </motion.div>

            <motion.div variants={row} className="space-y-1.5">
              <label className="text-xs text-white/40 px-1">المبلغ</label>
              <Input type="number" placeholder="0.00"
                className="h-14 rounded-xl bg-white/3 border-white/10 text-white text-right px-5 text-base focus-visible:ring-yellow-500/40 focus-visible:border-yellow-500/30 transition-all placeholder:text-white/20"
                dir="ltr" />
            </motion.div>
          </div>

          {/* payment method */}
          <motion.div variants={row} className="mb-8">
            <p className="text-xs text-white/40 px-1 mb-3">طريقة الدفع</p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setPaymentMethod("instapay")}
                className={`h-13 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                  paymentMethod === "instapay"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400/50"
                    : "bg-white/4 text-white/40 border-white/10 hover:border-white/20"
                }`}
                style={paymentMethod === "instapay" ? { boxShadow: "0 0 20px rgba(249,115,22,0.3)" } : {}}
              >
                InstaPay
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setPaymentMethod("other")}
                className={`h-13 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  paymentMethod === "other"
                    ? "bg-white/15 text-white border-white/30"
                    : "bg-white/4 text-white/40 border-white/10 hover:border-white/20"
                }`}
              >
                Vodafone / Etisalat
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={row}>
            <Button
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-lg font-extrabold hover:from-yellow-400 hover:to-amber-400 transition-all relative overflow-hidden"
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
