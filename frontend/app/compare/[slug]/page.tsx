/**
 * Single comparative article. Content and video placeholders for later.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitCompare, Calendar } from "lucide-react";

const placeholderComparisons: Record<
  string,
  { title: string; excerpt: string; date: string; body: string }
> = {
  "bosch-vs-makita-burtchi": {
    title: "Bosch vs Makita: ბურღები შედარებით",
    excerpt:
      "ორი პოპულარული ბრენდის ბურღების მახასიათებლები და რომელი უკეთესია სხვადასხვა ამოცანისთვის.",
    date: "2025-02-05",
    body: "აქ მალე გამოჩნდება სრული შედარებითი სტატიის ტექსტი და ცხრილები. ვიდეო მასალები მოგვიანებით დაემატება.",
  },
  "saghebavebi-shedareba-emulsia-vs-silikat": {
    title: "საღებავების შედარება: ემულსია vs სილიკატი",
    excerpt: "შიდა საღებავების ტიპები — უპირატესობები და ნაკლოვანებები.",
    date: "2025-01-20",
    body: "აქ მალე გამოჩნდება სრული შედარება.",
  },
  "osb-vs-fanera-vs-tabashir-muqua": {
    title: "OSB vs ფანერა vs თაბაშირ-მუყაო: რა აირჩიოთ?",
    excerpt:
      "სხვადასხვა ფურცლოვანი მასალის შედარება კედლებისა და იატაკისთვის.",
    date: "2025-01-10",
    body: "აქ მალე გამოჩნდება სრული შედარებითი სტატია.",
  },
};

export default async function CompareArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = placeholderComparisons[slug];
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          შედარებითი სტატიები
        </Link>
        <header className="mb-8">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            შედარება
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
