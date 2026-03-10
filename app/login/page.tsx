"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { Sun, Moon } from "lucide-react";
import Swal from "sweetalert2";
import { useTheme } from "@/components/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Success',
      text: 'Redirecting to dashboard...',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: isDark ? '#13131A' : '#FFFFFF',
      color: isDark ? '#F2F2F8' : '#0A0A0F',
      iconColor: '#6C63FF',
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#6C63FF',
      background: isDark ? '#13131A' : '#FFFFFF',
      color: isDark ? '#F2F2F8' : '#0A0A0F',
      iconColor: '#FF4D6A',
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Login failed");
      
      showSuccessAlert();
      
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      showErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-base-100 to-base-200">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 btn btn-ghost btn-sm btn-square"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Animated blobs */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-4 shadow-lg shadow-primary/30">
            <FiLogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-base-content font-display">
            Welcome Back
          </h1>
          <p className="text-sm text-neutral-content/60">
            Please enter your credentials to login
          </p>
        </div>

        <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300 shadow-2xl">
          <div className="card-body p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-content/60">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-neutral-content/60" />
                  </div>
                  <input
                    className="input input-bordered w-full pl-10 pr-4 py-3 text-sm bg-base-300 border-base-300/20 text-base-content focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-content/60">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-neutral-content/60" />
                  </div>
                  <input
                    className="input input-bordered w-full pl-10 pr-12 py-3 text-sm bg-base-300 border-base-300/20 text-base-content focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-content/60 hover:text-primary transition-colors duration-200"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3.5"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
