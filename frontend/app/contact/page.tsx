"use client";

/**
 * Contact Page – form + company info. For support/FAQ see /support.
 */
import { useState } from "react";
import { supportAPI } from "@/lib/api";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      await supportAPI.create({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        message: formData.message.trim(),
        requestType: "general",
      });
      setStatus("success");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
            კონტაქტი
          </h1>
          <p className="text-slate-400 text-lg">
            დაგვიკავშირდით — პასუხობთ სწრაფად
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              გაგზავნეთ შეტყობინება
            </h2>

            {status === "success" && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                თქვენი შეტყობინება წარმატებით გაიგზავნა. დაგიკავშირდებით მალე.
              </div>
            )}
            {status === "error" && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-slate-400 text-sm font-medium mb-2"
                >
                  სახელი *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  placeholder="თქვენი სახელი"
                  disabled={status === "loading"}
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-slate-400 text-sm font-medium mb-2"
                >
                  ტელეფონი *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  placeholder="+995 5XX XX XX XX"
                  disabled={status === "loading"}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-slate-400 text-sm font-medium mb-2"
                >
                  ელფოსტა
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  placeholder="example@mail.com"
                  disabled={status === "loading"}
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-slate-400 text-sm font-medium mb-2"
                >
                  შეტყობინება *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 resize-none"
                  placeholder="დაწერეთ თქვენი შეტყობინება..."
                  disabled={status === "loading"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:from-orange-600 hover:to-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    იგზავნება...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    გაგზავნა
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-6">
                სწრაფი კონტაქტი
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium mb-1">მისამართი</p>
                    <p className="text-slate-400 text-sm">გორი, საქართველო</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                    <Phone className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium mb-1">ტელეფონი</p>
                    <a
                      href="tel:+995551318202"
                      className="text-slate-400 hover:text-orange-400 transition-colors text-sm"
                    >
                      +995 551 31 82 02
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                    <Mail className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium mb-1">ელფოსტა</p>
                    <a
                      href="mailto:didostati.info@gmail.com"
                      className="text-slate-400 hover:text-orange-400 transition-colors text-sm break-all"
                    >
                      didostati.info@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
              <p className="text-slate-400 text-sm leading-relaxed">
                ასევე შეგიძლიათ დაგვირეკოთ ან გამოგვიგზავნოთ შეტყობინება WhatsApp-ით
                — პასუხობთ ყველა შეკითხვაზე სწრაფად.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
