import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminLogin, useGetAdminUsers, useBanUser, useUnbanUser, useLogout } from "@workspace/api-client-react";
import { LogOut, Ban, CheckCircle, Key, Users, ShieldOff, RefreshCw } from "lucide-react";

const OWNER_EMAIL = "omareltweel012@gmail.com";

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));
  const [, setLocation] = useLocation();

  const currentEmail = localStorage.getItem("userEmail") ?? "";
  const isOwner = currentEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const adminLogin = useAdminLogin();
  const { data: users, refetch, isFetching } = useGetAdminUsers({
    query: { enabled: isAdmin }
  });

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const logout = useLogout();

  const activeUsers = users?.filter((u) => !u.isBanned) ?? [];
  const bannedUsers = users?.filter((u) => u.isBanned) ?? [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { data: { password } },
      {
        onSuccess: (res) => {
          if (res.success && res.message) {
            localStorage.setItem("adminToken", res.message);
            setIsAdmin(true);
            refetch();
          }
        },
      }
    );
  };

  const handleBan = (userId: number) => {
    banUser.mutate({ userId }, { onSuccess: () => refetch() });
  };

  const handleUnban = (userId: number) => {
    unbanUser.mutate({ userId }, { onSuccess: () => refetch() });
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("sessionToken");
        setLocation("/");
      },
    });
  };

  return (
    <>
      {isOwner && (
        <button
          data-testid="button-admin-key"
          onClick={() => setIsOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          <Key size={24} />
        </button>
      )}

      <div className="absolute top-4 right-4 z-50">
        <button
          data-testid="button-user-logout"
          onClick={handleLogout}
          className="p-2 text-white/50 hover:text-white transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="bg-[#0f0f15] border-white/10 text-white max-w-2xl w-full"
          style={{ direction: "rtl" }}
        >
          <DialogHeader>
            <DialogTitle className="text-right text-yellow-500 text-xl font-bold flex items-center justify-between gap-2">
              <span>لوحة الإدارة</span>
              {isAdmin && (
                <button
                  onClick={() => refetch()}
                  className="text-white/40 hover:text-white transition-colors"
                  title="تحديث"
                >
                  <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                </button>
              )}
            </DialogTitle>
          </DialogHeader>

          {!isAdmin ? (
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/30"
                dir="rtl"
                data-testid="input-admin-password"
              />
              {adminLogin.isError && (
                <p className="text-red-400 text-sm text-right">كلمة المرور غير صحيحة</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-400 hover:to-yellow-500"
                disabled={adminLogin.isPending}
                data-testid="button-admin-login"
              >
                {adminLogin.isPending ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pl-1">

              {/* Active Accounts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-green-400" />
                  <h3 className="text-green-400 font-bold text-sm">
                    الحسابات النشطة ({activeUsers.length})
                  </h3>
                </div>

                {activeUsers.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">لا توجد حسابات نشطة</p>
                ) : (
                  <div className="space-y-2">
                    {activeUsers.map((user) => (
                      <div
                        key={user.id}
                        data-testid={`row-user-${user.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-green-500/10"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-white text-sm font-mono" dir="ltr">
                            {user.email}
                          </span>
                          <span className="text-green-400/70 text-xs flex items-center gap-1">
                            {user.email.toLowerCase() === OWNER_EMAIL.toLowerCase() && (
                              <span className="text-yellow-400">★ مالك</span>
                            )}
                            {user.isActive ? "متصل الآن" : "مسجل"}
                          </span>
                        </div>
                        {user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase() && (
                          <Button
                            onClick={() => handleBan(user.id)}
                            variant="outline"
                            size="sm"
                            disabled={banUser.isPending}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 text-xs gap-1"
                            data-testid={`button-ban-${user.id}`}
                          >
                            <Ban className="h-3 w-3" />
                            حظر وإخراج
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Banned Accounts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldOff size={16} className="text-red-400" />
                  <h3 className="text-red-400 font-bold text-sm">
                    الحسابات المحظورة ({bannedUsers.length})
                  </h3>
                </div>

                {bannedUsers.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">لا توجد حسابات محظورة</p>
                ) : (
                  <div className="space-y-2">
                    {bannedUsers.map((user) => (
                      <div
                        key={user.id}
                        data-testid={`row-banned-${user.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-red-500/10"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-white/70 text-sm font-mono line-through" dir="ltr">
                            {user.email}
                          </span>
                          <span className="text-red-400/70 text-xs">محظور</span>
                        </div>
                        <Button
                          onClick={() => handleUnban(user.id)}
                          variant="outline"
                          size="sm"
                          disabled={unbanUser.isPending}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/60 text-xs gap-1"
                          data-testid={`button-unban-${user.id}`}
                        >
                          <CheckCircle className="h-3 w-3" />
                          فك الحظر
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
