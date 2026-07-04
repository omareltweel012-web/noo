import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminLogin, useGetAdminUsers, useBanUser, useUnbanUser, useLogout } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { LogOut, Ban, CheckCircle, Key } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));
  const [, setLocation] = useLocation();

  const adminLogin = useAdminLogin();
  const queryClient = useQueryClient();
  const { data: users, refetch } = useGetAdminUsers({
    query: { enabled: isAdmin }
  });
  
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const logout = useLogout();

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
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-50 p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
      >
        <Key size={24} />
      </button>

      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="p-2 text-white/50 hover:text-white transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0f0f15] border-white/10 text-white dir-rtl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-yellow-500 text-xl font-bold">لوحة الإدارة</DialogTitle>
          </DialogHeader>

          {!isAdmin ? (
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div>
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/30"
                  dir="rtl"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500"
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col gap-2">
                    <span className="text-white font-mono" dir="ltr">{user.email}</span>
                    <div className="flex gap-2">
                      <Badge variant={user.isBanned ? "destructive" : "secondary"} className="bg-opacity-20">
                        {user.isBanned ? "محظور" : "نشط"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    {user.isBanned ? (
                      <Button 
                        onClick={() => handleUnban(user.id)}
                        variant="outline" 
                        size="sm"
                        className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                      >
                        <CheckCircle className="ml-2 h-4 w-4" />
                        تفعيل
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleBan(user.id)}
                        variant="outline" 
                        size="sm"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      >
                        <Ban className="ml-2 h-4 w-4" />
                        حظر
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}