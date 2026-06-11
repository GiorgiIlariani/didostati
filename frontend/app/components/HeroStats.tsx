const HeroStats = ({ className = "" }: { className?: string }) => {
  return (
    <section
      className={`py-8 bg-slate-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              1000+
            </div>
            <div className="text-sm text-slate-400">პროდუქტი</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              24სთ
            </div>
            <div className="text-sm text-slate-400">მიწოდება</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              500+
            </div>
            <div className="text-sm text-slate-400">კმაყოფილი კლიენტი</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroStats;
