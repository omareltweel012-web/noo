import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAdminLogin, useGetAdminUsers, useBanUser, useUnbanUser,
  useApproveUser, useDeleteUser, useResetUserDevice,
} from "@workspace/api-client-react";
import Particles from "../components/Particles";
import {
  Key, LogOut, Ban, CheckCircle, Clock, Users, ShieldOff,
  Trash2, RefreshCw, ArrowRight, Smartphone,
} from "lucide-react";

const OWNER_EMAIL = "omareltweel012@gmail.com";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const adminLogin = useAdminLogin();
  const { data: users, refetch, isFetching, isError } = useGetAdminUsers({
    query: { enabled: isAdmin, refetchInterval: isAdmin ? 5000 : false, retry: false },
  });

  useEffect(() => {
    if (isError && isAdmin) {
      localStorage.removeItem("adminToken");
      setIsAdmin(false);
    }
  }, [isError, isAdmin]);

  const approveUser = useApproveUser();
  const banUser     = useBanUser();
  const unbanUser   = useUnbanUser();
  const deleteUser      = useDeleteUser();
  const resetDevice     = useResetUserDevice();

  const pendingUsers = users?.filter((u) => u.status === "pending" && !u.isBanned) ?? [];
  const activeUsers  = users?.filter((u) => u.status === "approved" && !u.isBanned) ?? [];
  const bannedUsers  = users?.filter((u) => u.isBanned) ?? [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate({ data: { password } }, {
      onSuccess: (res) => {
        if (res.success && res.message) {
          localStorage.setItem("adminToken", res.message);
          setIsAdmin(true);
          refetch();
        }
      },
    });
  };

  const handleDelete = (userId: number) => {
    if (confirmDelete !== userId) { setConfirmDelete(userId); return; }
    deleteUser.mutate({ userId }, { onSuccess: () => { setConfirmDelete(null); refetch(); } });
  };

  // ── Password screen ──
  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative p-4">
        <Particles />
        <div className="w-full max-w-sm z-10 relative">
          <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-1 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowRight size={14} /> رجوع للوحة
          </button>
          <div className="bg-white/5 backdrop-blur-md border border-yellow-500/20 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.3)]">
                <Key size={26} className="text-black" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-center text-yellow-400 mb-6">لوحة الإدارة</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/30 h-12"
                dir="rtl"
              />
              {adminLogin.isError && (
                <p className="text-red-400 text-sm text-center">كلمة المرور غير صحيحة</p>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-400 hover:to-yellow-500"
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ──
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white" dir="rtl">
      <Particles />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Key size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-yellow-400 font-bold text-lg leading-none">لوحة الإدارة</h1>
            <p className="text-white/30 text-xs mt-0.5">إدارة المستخدمين</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-2 text-white/50 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5"
          >
            <LogOut size={15} />
            رجوع
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3 px-6 py-5">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{pendingUsers.length}</p>
          <p className="text-yellow-400/60 text-xs mt-1">في الانتظار</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{activeUsers.length}</p>
          <p className="text-green-400/60 text-xs mt-1">نشط</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{bannedUsers.length}</p>
          <p className="text-red-400/60 text-xs mt-1">محظور</p>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-10 space-y-6">

        {/* ── Pending ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-yellow-400" />
            <h2 className="text-yellow-400 font-bold text-sm">في انتظار الموافقة ({pendingUsers.length})</h2>
          </div>
          {pendingUsers.length === 0
            ? <p className="text-white/20 text-sm text-center py-4 border border-white/5 rounded-2xl">لا يوجد طلبات معلقة</p>
            : (
              <div className="space-y-2">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/15">
                    <div>
                      <p className="text-white text-sm font-mono" dir="ltr">{u.email}</p>
                      <p className="text-yellow-400/60 text-xs mt-0.5">ينتظر الموافقة</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { approveUser.mutate({ userId: u.id }, { onSuccess: () => refetch() }); }}
                        size="sm" disabled={approveUser.isPending}
                        className="bg-green-500/15 hover:bg-green-500/25 text-green-400 border-0 text-xs gap-1 h-8">
                        <CheckCircle className="h-3 w-3" /> موافقة
                      </Button>
                      <Button onClick={() => { banUser.mutate({ userId: u.id }, { onSuccess: () => refetch() }); }}
                        size="sm" disabled={banUser.isPending}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0 text-xs gap-1 h-8">
                        <Ban className="h-3 w-3" /> رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>

        {/* ── Active ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-green-400" />
            <h2 className="text-green-400 font-bold text-sm">الحسابات النشطة ({activeUsers.length})</h2>
          </div>
          {activeUsers.length === 0
            ? <p className="text-white/20 text-sm text-center py-4 border border-white/5 rounded-2xl">لا توجد حسابات نشطة</p>
            : (
              <div className="space-y-2">
                {activeUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-green-500/10">
                    <div>
                      <p className="text-white text-sm font-mono" dir="ltr">{u.email}</p>
                      <p className="text-xs mt-0.5 flex items-center gap-1">
                        {u.email.toLowerCase() === OWNER_EMAIL.toLowerCase() && <span className="text-yellow-400">★ مالك</span>}
                        <span className={u.isActive ? "text-green-400/70" : "text-white/30"}>
                          {u.isActive ? "● متصل الآن" : "○ مسجل"}
                        </span>
                      </p>
                    </div>
                    {u.email.toLowerCase() !== OWNER_EMAIL.toLowerCase() && (
                      <div className="flex gap-2">
                        {u.lockedDeviceId && (
                          <Button onClick={() => { resetDevice.mutate({ userId: u.id }, { onSuccess: () => refetch() }); }}
                            size="sm" disabled={resetDevice.isPending}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-0 text-xs gap-1 h-8"
                            title="فك ارتباط الجهاز">
                            <Smartphone className="h-3 w-3" /> فك الجهاز
                          </Button>
                        )}
                        <Button onClick={() => { banUser.mutate({ userId: u.id }, { onSuccess: () => refetch() }); }}
                          size="sm" disabled={banUser.isPending}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0 text-xs gap-1 h-8">
                          <Ban className="h-3 w-3" /> حظر وإخراج
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </section>

        {/* ── Banned ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldOff size={15} className="text-red-400" />
            <h2 className="text-red-400 font-bold text-sm">الحسابات المحظورة ({bannedUsers.length})</h2>
          </div>
          {bannedUsers.length === 0
            ? <p className="text-white/20 text-sm text-center py-4 border border-white/5 rounded-2xl">لا توجد حسابات محظورة</p>
            : (
              <div className="space-y-2">
                {bannedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-red-500/10">
                    <div>
                      <p className="text-white/50 text-sm font-mono line-through" dir="ltr">{u.email}</p>
                      <p className="text-red-400/60 text-xs mt-0.5">محظور</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { unbanUser.mutate({ userId: u.id }, { onSuccess: () => refetch() }); }}
                        size="sm" disabled={unbanUser.isPending}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border-0 text-xs gap-1 h-8">
                        <CheckCircle className="h-3 w-3" /> فك الحظر
                      </Button>
                      <Button
                        onClick={() => handleDelete(u.id)}
                        size="sm"
                        disabled={deleteUser.isPending}
                        className={`border-0 text-xs gap-1 h-8 transition-all ${
                          confirmDelete === u.id
                            ? "bg-red-600/40 hover:bg-red-600/60 text-red-200"
                            : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                        {confirmDelete === u.id ? "تأكيد الحذف؟" : "حذف"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>

      </div>
    </div>
  );
}
