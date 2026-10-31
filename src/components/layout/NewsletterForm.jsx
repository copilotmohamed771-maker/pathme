"use client";

import { showToast } from "@/lib/toast";

export function NewsletterForm() {
  function handleSubmit(e) {
    e.preventDefault();
    // TODO(backend): POST the address to the newsletter service.
    showToast("Subscribed!", "You have been added to the PathMe updates newsletter.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Student email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Enter student email"
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-700 text-white text-xs focus:outline-none focus:border-brand-innovation"
      />
      <button
        type="submit"
        className="w-full py-2 bg-brand-innovation hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition"
      >
        Subscribe
      </button>
    </form>
  );
}
