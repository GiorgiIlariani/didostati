interface HeroMediaFrameProps {
  src: string;
  type: "video" | "image";
  alt?: string;
  autoPlay?: boolean;
  controls?: boolean;
  variant?: "default" | "hero";
  className?: string;
}

const HeroMediaFrame = ({
  src,
  type,
  alt = "",
  autoPlay = true,
  controls = false,
  variant = "default",
  className = "",
}: HeroMediaFrameProps) => {
  const isHero = variant === "hero";
  const bgClass = isHero
    ? "absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-30 saturate-125 sm:blur-2xl sm:opacity-40"
    : "absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40 saturate-125";
  const fgClass = "relative z-10 h-full w-full object-contain";

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-950 ${
        isHero
          ? "aspect-video w-full sm:aspect-[16/10] lg:aspect-video"
          : "aspect-video rounded-xl"
      } ${className}`}>
      <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-slate-950 to-slate-900/90" />

      {type === "video" ? (
        <>
          <video
            src={src}
            autoPlay={autoPlay}
            muted
            loop
            playsInline
            className={bgClass}
            aria-hidden
          />
          <video
            src={src}
            autoPlay={autoPlay}
            muted
            loop
            playsInline
            controls={controls}
            className={fgClass}
            aria-label={alt}
          />
        </>
      ) : (
        <>
          <img src={src} alt="" aria-hidden className={bgClass} />
          <img src={src} alt={alt} className={fgClass} />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 ring-1 ring-inset ring-white/10" />
      {!isHero && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-linear-to-t from-slate-950/30 via-transparent to-slate-950/20" />
      )}
    </div>
  );
};

export default HeroMediaFrame;
