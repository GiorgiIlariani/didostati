/**
 * Blog & Tips – list of articles.
 * Content and videos can be added later.
 */
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";

const placeholderPosts = [
  {
    slug: "saremonto-masalebi-shesadgeneba",
    title: "სარემონტო მასალების შედგენა: რა გჭირდებათ პირველი რემონტისთვის",
    excerpt: "მოკლე გზამკვლევი იმის შესახებ, რა მასალები უნდა აიღოთ და რა თანმიმდევრობით.",
    date: "2025-02-01",
  },
  {
    slug: "khis-masalebi-saghebavebit",
    title: "ხის მასალები საღებავებთან: შერჩევა და გამოყენება",
    excerpt: "როგორ შევარჩიოთ ხის ტიპი და საღებავი ინტერიერისთვის.",
    date: "2025-01-15",
  },
  {
    slug: "santeknika-saqmebi-sakmarisi-instrumentebi",
    title: "სანტექნიკის საქმეები — საკმარისი ინსტრუმენტები",
    excerpt: "საყოფაცხოვრებო სანტექნიკის სამუშაოებისთვის საჭირო ინსტრუმენტების სია.",
    date: "2025-01-08",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 relative">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            ბლოგი და რჩევები
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-slate-100">სასარგებლო </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              სტატიები
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            რჩევები, გზამკვლევები და პრაქტიკული ინფორმაცია სარემონტო და სამშენებლო მასალების შესახებ.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <ul className="space-y-6">
            {placeholderPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6 md:p-8 hover:border-orange-500/40 hover:bg-slate-800/80 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString("ka-GE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 mb-4">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm group-hover:gap-3 transition-all">
                    წაიკითხე
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-slate-500 text-sm">
            მეტი სტატია მალე დაემატება.
          </p>
        </div>
      </section>
    </div>
  );
}
