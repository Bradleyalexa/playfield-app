"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";

const ADMIN_PIN = "4137";
const STORAGE_KEY = "playfield_admin_pin";

interface AdminPinGateProps {
  children: React.ReactNode;
  pageTitle: string;
}

export function AdminPinGate({ children, pageTitle }: AdminPinGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedPin = sessionStorage.getItem(STORAGE_KEY);
      if (savedPin === ADMIN_PIN) {
        setIsAuthenticated(true);
      }
    } catch {}
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isChecking) {
      inputRef.current?.focus();
    }
  }, [isAuthenticated, isChecking]);

  const handlePinChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setPin(clean);
    setError(null);

    if (clean.length === 4) {
      if (clean === ADMIN_PIN) {
        try {
          sessionStorage.setItem(STORAGE_KEY, ADMIN_PIN);
        } catch {}
        setIsAuthenticated(true);
      } else {
        setError("PIN salah. Akses ditolak.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      handlePinChange(pin + digit);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center font-mono font-bold text-black">
        Memverifikasi akses...
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-4 font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className={`w-full max-w-sm rounded-3xl border-3 sm:border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000] flex flex-col items-center text-center gap-5 transition-transform ${
          shake ? "animate-bounce" : ""
        }`}
      >
        {/* Lock Icon */}
        <div className="h-14 w-14 rounded-2xl bg-[#ccff00] border-3 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
          <Lock className="h-7 w-7 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black text-[#ccff00]">
            Restricted Area
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mt-1.5">
            {pageTitle}
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Masukkan 4-digit PIN keamanan admin untuk membuka halaman ini
          </p>
        </div>

        {/* Hidden Real Input for keyboard support */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => handlePinChange(e.target.value)}
          className="opacity-0 absolute -z-10"
          autoFocus
        />

        {/* 4-Digit Display Boxes */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex items-center justify-center gap-3 cursor-pointer py-1"
        >
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`h-12 w-12 rounded-xl border-3 border-black flex items-center justify-center text-lg font-black transition-all ${
                  hasDigit
                    ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                    : "bg-[#faf8f2] text-slate-400"
                }`}
              >
                {hasDigit ? "•" : ""}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 border-2 border-rose-400 px-3 py-1.5 rounded-xl">
            <ShieldAlert className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Custom Numpad UI */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-11 rounded-xl border-2 border-black bg-[#faf8f2] hover:bg-[#ccff00] text-black font-black text-base shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin("")}
            className="h-11 rounded-xl border-2 border-black bg-zinc-100 hover:bg-zinc-200 text-slate-700 font-bold text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-11 rounded-xl border-2 border-black bg-[#faf8f2] hover:bg-[#ccff00] text-black font-black text-base shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 rounded-xl border-2 border-black bg-zinc-100 hover:bg-zinc-200 text-slate-700 font-bold text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Del
          </button>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-black hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}

export function lockAdminSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  } catch {}
}

