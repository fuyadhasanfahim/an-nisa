"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/toast/useToast";
import { IconSend, IconCheck } from "@tabler/icons-react";
import { authClient } from "@/lib/auth/auth-client";

export function BoutiqueContactForm({
  defaultSubject = "",
  className = "",
}: {
  defaultSubject?: string;
  className?: string;
}) {
  const { toast } = useToast();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject,
    message: "",
  });
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync user email/name when session loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        name: prev.name || user.name || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deliver enquiry.");
      }

      setSuccess(true);
      toast({
        title: "Enquiry Sent",
        message: "Thank you! We have received your message and will reach out shortly.",
        variant: "success",
      });

      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: defaultSubject,
        message: "",
      });

      // Reset success state after a few seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        message: err.message || "Something went wrong while delivering your message.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-4 rounded-3xl stitch-border bg-white/95 p-6 sm:p-8 shadow-softSm w-full ${className}`}
      id="boutique-contact-form"
    >
      <div className="space-y-1.5 mb-2">
        <h3 className="font-serif text-xl font-bold text-brand-black">Send us a thread</h3>
        <p className="text-xs text-black/45 font-semibold">
          Have a question about custom fittings, sizes, or delivery? Write us below.
        </p>
      </div>

      <div className={`grid gap-4 ${user ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-black/50">Name</span>
          <input
            required
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-xl border border-black/10 px-4 focus:border-brand-pink focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-sm font-semibold"
          />
        </label>
        {!user && (
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-black/50">Email</span>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 rounded-xl border border-black/10 px-4 focus:border-brand-pink focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-sm font-semibold"
            />
          </label>
        )}
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-black/50">Subject</span>
        <input
          required
          type="text"
          placeholder="What is this enquiry about?"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="h-11 rounded-xl border border-black/10 px-4 focus:border-brand-pink focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-sm font-semibold"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-black/50">Message</span>
        <textarea
          required
          placeholder="Write your specifications, deadlines, or tailoring concerns..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="min-h-28 rounded-xl border border-black/10 px-4 py-3 focus:border-brand-pink focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-sm font-semibold"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={`h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-softSm border border-[#fcc4c8]/30 ${
          success
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-[#fcc4c8] text-brand-black hover:bg-[#fcc4c8]/85 hover:scale-[1.01] active:scale-[0.99]"
        }`}
      >
        {pending ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : success ? (
          <>
            <IconCheck className="h-4 w-4" stroke={2.5} />
            Sent Successfully
          </>
        ) : (
          <>
            <IconSend className="h-4 w-4" stroke={1.8} />
            Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}
