/**
 * "როგორ შევარჩიო სწორად?" – guides section.
 * Content and videos can be added later.
 */
import Link from "next/link";
import { ArrowRight, HelpCircle, CheckCircle } from "lucide-react";

const placeholderGuides = [
  {
    slug: "saghebavebi",
    title: "როგორ შევარჩიოთ საღებავი სწორად?",
    excerpt: "შიდა, გარე, ჭერის საღებავი — რას ვუყურებთ და როგორ ვირჩევთ.",
  },
  {
    slug: "khis-masalebi",
    title: "როგორ შევარჩიოთ ხის მასალები?",
    excerpt: "OSB, ფანერა, ბლოკები — დანიშნულება და ხარისხის კრიტერიუმები.",
  },
  {
    slug: "instrumentebi",
    title: "როგორ შევარჩიოთ ინსტრუმენტები?",
    excerpt: "პროფესიონალური vs საყოფაცხოვრებო და რა ნაკრები გჭირდებათ.",
  },
  {
    slug: "santeknika",
    title: "როგორ შევარჩიოთ სანტექნიკის მასალები?",
    excerpt: "მილები, ონკანები, შეერთებები — რას ვაქცევთ ყურადღებას.",
  },
];

export default function HowToChoosePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 relative">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            გზამკვლევი
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-slate-100">როგორ </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              შევარჩიო სწორად?
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            მარტივი ნაბიჯები და კრიტერიუმები, რომ სწორად აირჩიოთ მასალები და ინსტრუმენტები.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <ul className="space-y-4">
            {placeholderGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/how-to-choose/${guide.slug}`}
                  className="flex items-start gap-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6 md:p-6 hover:border-orange-500/40 hover:bg-slate-800/80 transition-all duration-200 group"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                      {guide.title}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{guide.excerpt}</p>
                  </div>
                  <span className="shrink-0 text-orange-400 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-slate-500 text-sm">
            მეტი გზამკვლევი მალე დაემატება.
          </p>
        </div>
      </section>
    </div>
  );
}
