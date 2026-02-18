/**
 * About Page
 * Company info and mission for Didostati.
 */
import Image from "next/image";
import { MapPin, Phone, Mail, Award, Truck, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
            ჩვენს შესახებ
          </h1>
          <p className="text-slate-400 text-lg">
            მარტივად. გამჭვირვალედ. პროფესიონალურად.
          </p>
        </div>

        {/* Company Section */}
        <div className="space-y-8">
          <section className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <Image
                src="/assets/images/623751947_122121815517039514_5435805212431744753_n.jpg"
                alt="Didostati"
                width={200}
                height={200}
                className="rounded-2xl object-cover ring-2 ring-orange-500/50"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                დიდოსტატი — სარემონტო და სამშენებლო მასალების ჰაბი
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                დიდოსტატი არის სარემონტო და სამშენებლო მასალების ჰაბი,
                რომელიც ამარტივებს მთელ პროცესს — არჩევიდან მიწოდებამდე.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                ჩვენი მიზანია, დაზოგო დრო, ენერგია და ზედმეტი რესურსი.
                ერთ სივრცეში გაერთიანებულია საჭირო პროდუქცია, მკაფიო ინფორმაცია და სწრაფი მიწოდება პირდაპირ შენი სახლის კარამდე.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                დიდოსტატი არ არის მხოლოდ ონლაინ მაღაზია.
                ჩვენ ვქმნით სწორ სტანდარტს ბაზარზე — ვუზიარებთ ცოდნას საზოგადოებას, ვეხმარებით ადამიანებს გააზრებულად შეარჩიონ მასალები და მივიღოთ უკეთესი შედეგი თითოეულ პროექტში.
              </p>
              <p className="text-slate-400 leading-relaxed font-medium">
                მარტივად. გამჭვირვალედ. პროფესიონალურად.
              </p>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              რატომ უნდა აირჩიოთ ჩვენ
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="shrink-0 p-2 rounded-lg bg-orange-500/10">
                  <Award className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">
                    ხარისხიანი პროდუქტები
                  </h3>
                  <p className="text-slate-400 text-sm">
                    ველი წამოყენებული ბრენდები და დამოწმებული მომწოდებლები.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="shrink-0 p-2 rounded-lg bg-orange-500/10">
                  <Truck className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">
                    სწრაფი მიწოდება
                  </h3>
                  <p className="text-slate-400 text-sm">
                    მიწოდება გორიდან და მიმდებარე რეგიონებიდან.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="shrink-0 p-2 rounded-lg bg-orange-500/10">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">
                    სანდოობა
                  </h3>
                  <p className="text-slate-400 text-sm">
                    საიმედო სერვისი და კონსულტაცია.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              დაგვიკავშირდით
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-medium">გორი, საქართველო</p>
                  <p className="text-slate-500 text-sm">ყოველთვის ღია</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-400 shrink-0" />
                <a
                  href="tel:+995551318202"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  +995 551 31 82 02
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-400 shrink-0" />
                <a
                  href="mailto:didostati.info@gmail.com"
                  className="text-slate-300 hover:text-orange-400 transition-colors break-all"
                >
                  didostati.info@gmail.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
