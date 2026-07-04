import { Link } from "wouter";
import { motion } from "framer-motion";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import PageTransition from "../components/PageTransition";
import { Receipt, Landmark, Zap } from "lucide-react";

const containerVariants = {
  animate: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="scanline-overlay min-h-[100dvh] flex flex-col items-center pt-20 px-4 pb-10 relative">
        <Particles />
        <AdminPanel />

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="z-10 w-full max-w-md flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="relative mb-6">
            <div className="absolute inset-0 rounded-[24px] bg-yellow-500/20 blur-2xl scale-110" />
            <div
              className="relative w-24 h-24 rounded-[24px] bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center"
              style={{ boxShadow: "0 0 60px rgba(255,184,0,0.4), 0 0 120px rgba(255,184,0,0.15)" }}
            >
              <Receipt size={44} className="text-black" />
              {/* corner accents */}
              <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-black/20 rounded-tr" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-black/20 rounded-bl" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-1"
              style={{ textShadow: "0 0 30px rgba(255,184,0,0.2)" }}>
              اختر الخدمة
            </h1>
            <p className="text-white/30 text-sm flex items-center justify-center gap-1">
              <Zap size={12} className="text-yellow-500" />
              مرحباً بك في المنصة
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            {/* Transfer card */}
            <motion.div variants={itemVariants}>
              <Link href="/transfer" className="block group">
                <motion.div
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-black/50 border border-yellow-500/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square cursor-pointer overflow-hidden"
                  style={{ boxShadow: "0 0 0 0 rgba(255,184,0,0)" }}
                >
                  {/* glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/15 to-yellow-600/15 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    style={{ boxShadow: "0 0 20px rgba(255,184,0,0.1)" }}
                  >
                    <Receipt size={30} className="text-yellow-400" />
                  </div>
                  <span className="text-white font-bold text-base text-center leading-tight">ايصالات التحويل</span>

                  {/* corner deco */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-yellow-500/30" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-yellow-500/30" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Tax card */}
            <motion.div variants={itemVariants}>
              <Link href="/tax" className="block group">
                <motion.div
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-black/50 border border-red-500/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/15 to-red-700/15 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    style={{ boxShadow: "0 0 20px rgba(239,68,68,0.1)" }}
                  >
                    <Landmark size={30} className="text-red-400" />
                  </div>
                  <span className="text-white font-bold text-base text-center leading-tight">الضريبة</span>

                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-red-500/30" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-red-500/30" />
                </motion.div>
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="w-full border border-white/8 bg-white/3 rounded-2xl h-12 flex items-center justify-center"
          >
            <span className="text-white/30 text-sm">يرجى اختيار الخدمة المطلوبة</span>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
