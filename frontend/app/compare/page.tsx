/**
 * Comparative articles – product comparisons.
 * Content and videos can be added later.
 */
import Link from "next/link";
import { ArrowRight, GitCompare, Calendar } from "lucide-react";

const placeholderComparisons = [
  {
    slug: "bosch-vs-makita-burtchi",
    title: "Bosch vs Makita: ბურღები შედარებით",
    excerpt: "ორი პოპულარული ბრენდის ბურღების მახასიათებლები და რომელი უკეთესია სხვადასხვა ამოცანისთვის.",
    date: "2025-02-05",
  },
  {
    slug: "saghebavebi-shedareba-emulsia-vs-silikat",
    title: "საღებავების შედარება: ემულსია vs სილიკატი",
    excerpt: "შიდა საღებავების ტიპები — უპირატესობები და ნაკლოვანებები.",
    date: "2025-01-20",
  },
  {
    slug: "osb-vs-fanera-vs-tabashir-muqua",
    title: "OSB vs ფანერა vs თაბაშირ-მუყაო: რა აირჩიოთ?",
    excerpt: "სხვადასხვა ფურცლოვანი მასალის შედარება კედლებისა და იატაკისთვის.",
    date: "2025-01-10",
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 relative">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            შედარებითი სტატიები
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-slate-100">პროდუქტების </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              შედარება
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            ობიექტური შედარებები და რეკომენდაციები, რომ სწორად აირჩიოთ.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <ul className="space-y-6">
            {placeholderComparisons.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/compare/${item.slug}`}
                  className="block rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6 md:p-8 hover:border-orange-500/40 hover:bg-slate-800/80 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString("ka-GE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-slate-400 mb-4">{item.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm group-hover:gap-3 transition-all">
                    წაიკითხე შედარება
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-slate-500 text-sm">
            მეტი შედარებითი სტატია მალე დაემატება.
          </p>
        </div>
      </section>
    </div>
  );
}
