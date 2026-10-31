"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast";

export function Toaster() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;

    const onToast = (event) => {
      setToast(event.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 4000);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" role="status" className="fixed bottom-6 right-6 z-50">
      {toast && (
        <div className="animate-toast-in bg-brand-dark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-gray-700">
          <div className="w-8 h-8 rounded-full bg-brand-innovation text-white flex items-center justify-center font-bold">
            <i className="fa-solid fa-check" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-sm">{toast.title}</p>
            <p className="text-xs text-gray-300">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
