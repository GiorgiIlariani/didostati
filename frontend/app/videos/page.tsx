/**
 * Video lessons – placeholder. Videos will be added later.
 */
import { Video, PlayCircle } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 relative">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Video className="w-4 h-4" />
            ვიდეო გაკვეთილები
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-slate-100">ვიდეო </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              გაკვეთილები
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            სარემონტო და სამშენებლო მასალების გამოყენების ინსტრუქციები და რჩევები ვიდეო ფორმატში.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 border-dashed p-12 md:p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-700/80 text-slate-500 mb-6">
              <PlayCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              ვიდეოები მალე დაემატება
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              აქ გამოჩნდება ვიდეო გაკვეთილები და ინსტრუქციები — როგორ გამოიყენოთ ინსტრუმენტები, მასალები და რა უნდა იცოდეთ რემონტის წინ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
