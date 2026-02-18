/**
 * Single product test article. Content and video placeholders for later.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, Calendar } from "lucide-react";

const placeholderTests: Record<
  string,
  { title: string; excerpt: string; date: string; body: string }
> = {
  "bosch-professional-drill-test": {
    title: "Bosch Professional ბურღის ტესტი",
    excerpt:
      "პრაქტიკაში გატესტული — სიმძლავრე, ხმალი, ხანგრძლივობა.",
    date: "2025-02-08",
    body: "აქ მალე გამოჩნდება სრული ტესტის რეპორტი. ვიდეო ჩანაწერი მოგვიანებით დაემატება.",
  },
  "saghebavebi-gamodzagleba-test": {
    title: "საღებავების გამოყენება: ტესტი და რეკომენდაციები",
    excerpt: "სხვადასხვა ბრენდის საღებავების გამოყენება რეალურ პირობებში.",
    date: "2025-01-25",
    body: "აქ მალე გამოჩნდება ტესტის შედეგები.",
  },
  "eleqtro-instrumentebi-sakmarisi-tsema": {
    title: "ელექტრო ინსტრუმენტები: საკმარისი ნაკრები სახლისთვის",
    excerpt: "რა ინსტრუმენტები გჭირდებათ საყოფაცხოვრებო რემონტისთვის.",
    date: "2025-01-12",
    body: "აქ მალე გამოჩნდება სრული სტატია.",
  },
};

export default async function TestArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = placeholderTests[slug];
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          პროდუქტის ტესტები
        </Link>
        <header className="mb-8">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            ტესტი
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
            <Calendar className="w-4 h-4" />
            {new Date(article.date).toLocaleDateString("ka-GE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-slate-400 text-lg">{article.excerpt}</p>
          )}
        </header>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {article.body}
          </p>
        </div>
      </article>
    </div>
  );
}
