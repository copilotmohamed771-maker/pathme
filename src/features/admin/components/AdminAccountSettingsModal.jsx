"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/lib/toast";
import {
  fetchAdminAccount,
  updateAdminPassword,
  updateAdminPhone,
} from "../api";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10";

export function AdminAccountSettingsModal({ open, onClose }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();

    fetchAdminAccount(controller.signal)
      .then((result) => {
        setAccount(result);
        setPhone(result.phone);
        setLoadError("");
        setLoading(false);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(error.message || "Could not load admin account.");
          setLoading(false);
        }
      })

    return () => controller.abort();
  }, [open]);

  async function handlePhoneSubmit(event) {
    event.preventDefault();
    if (!account || savingPhone) return;
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      setLoadError("Enter a WhatsApp phone number.");
      return;
    }

    setSavingPhone(true);
    setLoadError("");
    try {
      await updateAdminPhone(account.id, normalizedPhone);
      setPhone(normalizedPhone);
    } catch (error) {
      setLoadError(error.message || "Could not update the WhatsApp number.");
      setSavingPhone(false);
      return;
    }

    try {
      const refreshedAccount = await fetchAdminAccount();
      setAccount(refreshedAccount);
      setPhone(refreshedAccount.phone);
      showToast("WhatsApp number updated", "The saved admin number was refreshed.");
    } catch (error) {
      setLoadError(
        `The number was saved, but could not be refreshed: ${error.message || "Please reopen settings to reload it."}`,
      );
    } finally {
      setSavingPhone(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!account || savingPassword) return;
    if (!newPassword.trim()) {
      setLoadError("Enter a new password.");
      return;
    }

    setSavingPassword(true);
    setLoadError("");
    try {
      await updateAdminPassword(account.id, newPassword);
      setNewPassword("");
      showToast("Password updated", "The admin password was changed.");
    } catch (error) {
      setLoadError(error.message || "Could not update the password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Admin account settings"
      variant="admin"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              Account settings
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-dark">
              Admin contact and security
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        {loading ? (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500" role="status">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Loading admin account...
          </p>
        ) : (
          <>
            {loadError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {loadError}
              </p>
            )}

            {account && (
              <>
                <form
                  onSubmit={handlePhoneSubmit}
                  className="space-y-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">
                      WhatsApp contact number
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      This is the number students will be directed to.
                    </p>
                  </div>
                  <label htmlFor="admin-whatsapp-phone" className="sr-only">
                    WhatsApp phone number
                  </label>
                  <input
                    id="admin-whatsapp-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="201012345678"
                    className={INPUT}
                  />
                  <button
                    type="submit"
                    disabled={savingPhone || savingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60"
                  >
                    {savingPhone && (
                      <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                    )}
                    Save phone number
                  </button>
                </form>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">
                      Change password
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Enter a new password for the admin account.
                    </p>
                  </div>
                  <label htmlFor="admin-new-password" className="sr-only">
                    New password
                  </label>
                  <input
                    id="admin-new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="New password"
                    className={INPUT}
                  />
                  <button
                    type="submit"
                    disabled={savingPassword || savingPhone}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {savingPassword && (
                      <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                    )}
                    Update password
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
