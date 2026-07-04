import { useState } from "react";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import { Receipt, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function Transfer() {
  const [paymentMethod, setPaymentMethod] = useState("instapay");

  return (
    <div className="min-h-[100dvh] flex flex-col items-center pt-8 px-4 pb-20 relative">
      <Particles />
      <AdminPanel />

      <div className="z-10 w-full flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          <Receipt size={24} className="text-white" />
        </div>
        <Link href="/dashboard" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-white/10">
          <ChevronRight size={24} />
        </Link>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-2">ايصالات التحويل</h1>
        <p className="text-white/50 mb-4 text-center">أدخل بيانات التحويل بدقة</p>
        
        <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 text-center">
          <p className="text-yellow-500 text-sm">مثال: احمد محمد - 01012345678 - 500</p>
        </div>

        <form className="w-full space-y-4 mb-8">
          <div className="space-y-1">
            <label className="text-sm text-white/70 px-2">الاسم</label>
            <Input
              type="text"
              placeholder="الاسم الثلاثي"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-yellow-500"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-white/70 px-2">الرقم</label>
            <Input
              type="tel"
              placeholder="رقم الهاتف"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-yellow-500"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70 px-2">المبلغ</label>
            <Input
              type="number"
              placeholder="0.00"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-yellow-500"
              dir="ltr"
            />
          </div>
        </form>

        <div className="w-full mb-8">
          <p className="text-sm text-white/70 px-2 mb-3 text-right">طريقة الدفع</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("instapay")}
              className={`h-12 rounded-xl text-sm font-bold border transition-colors ${
                paymentMethod === "instapay" 
                  ? "bg-orange-500 text-white border-orange-400" 
                  : "bg-white/5 text-white/50 border-white/10"
              }`}
            >
              InstaPay
            </button>
            <button
              onClick={() => setPaymentMethod("other")}
              className={`h-12 rounded-xl text-sm font-bold border transition-colors ${
                paymentMethod === "other" 
                  ? "bg-white/20 text-white border-white/30" 
                  : "bg-white/5 text-white/50 border-white/10"
              }`}
            >
              Vodafone/Etisalat/Orange
            </button>
          </div>
        </div>

        <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-lg font-bold hover:from-yellow-400 hover:to-yellow-500 shadow-[0_0_20px_rgba(255,184,0,0.2)]">
          تسجيل
        </Button>
      </div>
    </div>
  );
}