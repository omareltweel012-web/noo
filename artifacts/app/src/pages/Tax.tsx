import { useState } from "react";
import Particles from "../components/Particles";
import AdminPanel from "../components/AdminPanel";
import { Landmark, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function Tax() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center pt-8 px-4 pb-20 relative">
      <Particles />
      <AdminPanel />

      <div className="z-10 w-full flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
          <Landmark size={24} className="text-red-500" />
        </div>
        <Link href="/dashboard" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-white/10">
          <ChevronRight size={24} />
        </Link>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-6">
          <Landmark size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">الضريبة</h1>
        
        <form className="w-full space-y-4 mb-8">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="الاسم"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-red-500 placeholder:text-white/40"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="الرصيد"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-red-500 placeholder:text-white/40"
              dir="rtl"
            />
          </div>

          <div className="space-y-1">
            <Input
              type="text"
              placeholder="رقم التحويل"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-red-500 placeholder:text-white/40"
              dir="rtl"
            />
          </div>

          <div className="space-y-1">
            <Input
              type="text"
              placeholder="الضريبة"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-red-500 placeholder:text-white/40"
              dir="rtl"
            />
          </div>

          <div className="space-y-1">
            <Input
              type="text"
              placeholder="رقم المستخدم"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-right px-6 text-lg focus-visible:ring-red-500 placeholder:text-white/40"
              dir="rtl"
            />
          </div>
        </form>

        <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-lg font-bold hover:from-yellow-400 hover:to-yellow-500 shadow-[0_0_20px_rgba(255,184,0,0.2)] mt-4">
          تسجيل
        </Button>
      </div>
    </div>
  );
}