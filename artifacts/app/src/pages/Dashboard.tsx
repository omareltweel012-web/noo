import { Link } from "wouter";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import { Receipt, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center pt-24 px-4 relative">
      <Particles />
      <AdminPanel />

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,184,0,0.3)] mb-6">
          <Receipt size={40} className="text-black" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-12 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">اختر الخدمة</h1>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <Link href="/transfer" className="block">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt size={32} className="text-yellow-500" />
              </div>
              <span className="text-white font-bold text-lg text-center">ايصالات التحويل</span>
            </div>
          </Link>

          <Link href="/tax" className="block">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark size={32} className="text-red-500" />
              </div>
              <span className="text-white font-bold text-lg text-center">الضريبة</span>
            </div>
          </Link>
        </div>

        <div className="w-full bg-white/5 border border-white/10 rounded-full h-12 flex items-center justify-center mb-12">
          <span className="text-white/50">يرجى اختيار الخدمة المطلوبة</span>
        </div>

        <Button disabled className="w-full h-14 rounded-xl bg-white/5 text-white/30 text-lg font-bold border border-white/10">
          تأكيد
        </Button>
      </div>
    </div>
  );
}