import { useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { LogOut, Key } from "lucide-react";

const OWNER_EMAIL = "omareltweel012@gmail.com";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const logout = useLogout();

  const currentEmail = localStorage.getItem("userEmail") ?? "";
  const isOwner = currentEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("userEmail");
        setLocation("/");
      },
    });
  };

  return (
    <>
      {isOwner && (
        <button
          data-testid="button-admin-key"
          onClick={() => setLocation("/admin")}
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
    </>
  );
}
