/**
 * Single blog/tips article. Content and video placeholders for later.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";

const placeholderPosts: Record<
  string,
  { title: string; excerpt: string; date: string; body: string }
> = {
  "saremonto-masalebi-shesadgeneba": {
    title: "სარემონტო მასალების შედგენა: რა გჭირდებათ პირველი რემონტისთვის",
    excerpt: "მოკლე გზამკვლევი იმის შესახებ, რა მასალები უნდა აიღოთ და რა თანმიმდევრობით.",
    date: "2025-02-01",
    body: "აქ მალე გამოჩნდება სრული სტატიის ტექსტი. შეგიძლიათ დაგვიკავშირდეთ, თუ გსურთ კონკრეტული თემის გაშუქება.",
  },
  "khis-masalebi-saghebavebit": {
    title: "ხის მასალები საღებავებთან: შერჩევა და გამოყენება",
    excerpt: "როგორ შევარჩიოთ ხის ტიპი და საღებავი ინტერიერისთვის.",
    date: "2025-01-15",
    body: "აქ მალე გამოჩნდება სრული სტატიის ტექსტი. ვიდეო გაკვეთილები მოგვიანებით დაემატება.",
  },
  "santeknika-saqmebi-sakmarisi-instrumentebi": {
    title: "სანტექნიკის საქმეები — საკმარისი ინსტრუმენტები",
    excerpt: "საყოფაცხოვრებო სანტექნიკის სამუშაოებისთვის საჭირო ინსტრუმენტების სია.",
    date: "2025-01-08",
    body: "აქ მალე გამოჩნდება სრული სტატიის ტექსტი.",
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = placeholderPosts[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ბლოგი
        </Link>
        <header className="mb-8">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            ბლოგი და რჩევები
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString("ka-GE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-slate-400 text-lg">{post.excerpt}</p>
          )}
        </header>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>
        </div>
      </article>
    </div>
  );
}
