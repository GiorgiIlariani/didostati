import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/assets/images/623751947_122121815517039514_5435805212431744753_n.jpg"
                alt="Didostati Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-400/30 group-hover:ring-orange-500 transition-all"
              />
              <div>
                <p className="text-lg font-bold bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                  DIDOSTATI
                </p>
                <p className="text-[10px] text-slate-400 tracking-wider -mt-1">
                  HOME IMPROVEMENT
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400">
              თქვენი სანდო პარტნიორი სარემონტო მასალებისა და სწრაფი
              მიწოდებისთვის საქართველოში.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              სწრაფი ბმულები
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  ყველა პროდუქტი
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  კატეგორიები
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  ჩვენს შესახებ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  კონტაქტი
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  მხარდაჭერა
                </Link>
              </li>
            </ul>
          </div>

          {/* Content / კონტენტი */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">კონტენტი</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  ბლოგი და რჩევები
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  შედარებითი სტატიები
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  ვიდეო გაკვეთილები
                </Link>
              </li>
              <li>
                <Link
                  href="/tests"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  პროდუქტის ტესტები
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-choose"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                  როგორ შევარჩიო სწორად?
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              საკონტაქტო ინფო
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 text-sm font-medium">
                    გორი, საქართველო
                  </p>
                  <p className="text-slate-500 text-xs">ყოველთვის ღია</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <a
                  href="tel:+995551318202"
                  className="text-slate-300 hover:text-orange-400 transition-colors text-sm">
                  +995 551 31 82 02
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <a
                  href="mailto:didostati.info@gmail.com"
                  className="text-slate-300 hover:text-orange-400 transition-colors text-sm break-all">
                  didostati.info@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              გამოგვყევით
            </h3>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/profile.php?id=61581185421956"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-orange-400 transition-colors group">
                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className="text-sm">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/didostati.ge?igsh=dXNvbDUwM2M4cXd0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-orange-400 transition-colors group">
                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-sm">@didostati.ge</span>
              </a>
              <a
                href="https://www.tiktok.com/@didostati.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-orange-400 transition-colors group">
                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                  <TikTokIcon className="w-5 h-5" />
                </div>
                <span className="text-sm">@didostati.ge</span>
              </a>
            </div>

            {/* Call to Action */}
            <div className="mt-6">
              <a
                href="tel:+995551318202"
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold text-sm rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg">
                <Phone className="w-4 h-4" />
                დაგვირეკეთ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Didostati. ყველა უფლება დაცულია.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                კონფიდენციალურობა
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                მომსახურების პირობები
              </Link>
              <Link
                href="/shipping"
                className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                მიწოდების ინფო
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
