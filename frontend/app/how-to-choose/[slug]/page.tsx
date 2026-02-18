/**
 * Single "how to choose" guide. Content and video placeholders for later.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";

const placeholderGuides: Record<
  string,
  { title: string; excerpt: string; body: string }
> = {
  saghebavebi: {
    title: "როგორ შევარჩიოთ საღებავი სწორად?",
    excerpt:
      "შიდა, გარე, ჭერის საღებავი — რას ვუყურებთ და როგორ ვირჩევთ.",
    body: "აქ მალე გამოჩნდება სრული გზამკვლევი საღებავების არჩევაზე. ვიდეო ინსტრუქციები მოგვიანებით დაემატება.",
  },
  "khis-masalebi": {
    title: "როგორ შევარჩიოთ ხის მასალები?",
    excerpt:
      "OSB, ფანერა, ბლოკები — დანიშნულება და ხარისხის კრიტერიუმები.",
    body: "აქ მალე გამოჩნდება სრული გზამკვლევი ხის მასალების შესახებ.",
  },
  instrumentebi: {
    title: "როგორ შევარჩიოთ ინსტრუმენტები?",
    excerpt:
      "პროფესიონალური vs საყოფაცხოვრებო და რა ნაკრები გჭირდებათ.",
    body: "აქ მალე გამოჩნდება სრული გზამკვლევი ინსტრუმენტების არჩევაზე.",
  },
  santeknika: {
    title: "როგორ შევარჩიოთ სანტექნიკის მასალები?",
    excerpt: "მილები, ონკანები, შეერთებები — რას ვაქცევთ ყურადღებას.",
    body: "აქ მალე გამოჩნდება სრული გზამკვლევი სანტექნიკის მასალების შესახებ.",
  },
};

export default async function HowToChooseGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = placeholderGuides[slug];
  if (!guide) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <Link
          href="/how-to-choose"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          როგორ შევარჩიო სწორად?
        </Link>
        <header className="mb-8">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            გზამკვლევი
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            {guide.title}
          </h1>
          {guide.excerpt && (
            <p className="mt-4 text-slate-400 text-lg">{guide.excerpt}</p>
          )}
        </header>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {guide.body}
          </p>
        </div>
      </article>
    </div>
  );
}
