"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Success!',
      text: 'Redirecting to dashboard...',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      iconColor: 'var(--accent)',
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
      confirmButtonColor: 'var(--accent)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[var(--bg)] to-[var(--surface)]">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-muted rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] mb-4 shadow-lg">
            <FiLogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)] font-['Syne']">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Please enter your credentials to login
          </p>
        </div>

        <div className="rounded-2xl p-8 backdrop-blur-lg shadow-2xl transform transition-all duration-300 hover:scale-[1.02] bg-[rgba(var(--surface-rgb),0.8)] border border-[rgba(var(--border-rgb),0.1)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-300 outline-none border-2 focus:border-[var(--accent)] bg-[var(--input-bg)] border-[var(--border)] text-[var(--text-primary)]"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <input
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-300 outline-none border-2 focus:border-[var(--accent)] bg-[var(--input-bg)] border-[var(--border)] text-[var(--text-primary)]"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl disabled:hover:translate-y-0 disabled:hover:shadow-none bg-gradient-to-r from-[var(--accent)] to-[var(--accent-muted)] text-white disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}