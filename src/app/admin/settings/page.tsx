"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Icon } from "@/components/SvgIcons";

export default function AdminSettingsPage() {
  const { locale, showToast } = useApp();

  // Form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Localization
  const labels = {
    title: locale === "ar" ? "إعدادات الأمان وحماية الحساب" : "Security & Account Protection",
    subtitle: locale === "ar" ? "تحديث كلمة المرور الخاصة بحساب المدير" : "Update administrator password credentials",
    oldPassword: locale === "ar" ? "كلمة المرور الحالية" : "Current Old Password",
    newPassword: locale === "ar" ? "كلمة المرور الجديدة" : "New Password Key",
    confirmPassword: locale === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password Key",
    submitBtn: locale === "ar" ? "تحديث كلمة المرور" : "CHANGE PASSWORD KEY",
    updatingBtn: locale === "ar" ? "جاري التحديث..." : "UPDATING PASSWORD...",
    successMsg: locale === "ar" ? "تم تحديث كلمة المرور بنجاح!" : "Password updated successfully!",
    mismatchMsg: locale === "ar" ? "كلمات المرور غير متطابقة!" : "Passwords do not match!",
    fillMsg: locale === "ar" ? "يرجى ملء جميع الحقول!" : "Please fill in all fields!",
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast(labels.fillMsg, "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(labels.mismatchMsg, "error");
      return;
    }

    setLoading(true);
    try {
      await api.auth.changeAdminPassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      showToast(labels.successMsg, "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${locale === "ar" ? "text-right" : "text-left"}`}>
      <div className="border-b border-border-color pb-4">
        <span className="text-xs font-bold text-soft-text uppercase font-semibold">
          {locale === "ar" ? "إعدادات المدير" : "Admin Account Settings"}
        </span>
      </div>

      <div className="flex justify-start">
        <form
          onSubmit={handlePasswordSubmit}
          className="w-full max-w-lg rounded-2xl border border-border-color bg-card-bg p-6 flex flex-col gap-4"
        >
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              {labels.title}
            </h3>
            <p className="text-3xs text-muted-text uppercase tracking-wider mt-1">
              {labels.subtitle}
            </p>
          </div>

          <div className="border-t border-border-color/30 pt-4 flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-4xs font-extrabold uppercase tracking-widest text-muted-text mb-2">
                {labels.oldPassword}
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-color bg-surface-deep px-4 py-2.5 text-xs text-white placeholder-muted-text/30 focus:border-primary-coral focus:outline-none transition-luxury"
              />
            </div>

            <div>
              <label className="block text-4xs font-extrabold uppercase tracking-widest text-muted-text mb-2">
                {labels.newPassword}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-color bg-surface-deep px-4 py-2.5 text-xs text-white placeholder-muted-text/30 focus:border-primary-coral focus:outline-none transition-luxury"
              />
            </div>

            <div>
              <label className="block text-4xs font-extrabold uppercase tracking-widest text-muted-text mb-2">
                {labels.confirmPassword}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-color bg-surface-deep px-4 py-2.5 text-xs text-white placeholder-muted-text/30 focus:border-primary-coral focus:outline-none transition-luxury"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-primary-coral py-3.5 text-xs font-black tracking-widest text-main-bg hover:bg-white transition-luxury shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? labels.updatingBtn : labels.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
