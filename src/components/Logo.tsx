import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const imgSize = size === "lg" ? "h-16" : size === "sm" ? "h-9" : "h-11";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <img
        src="/logo.jpeg"
        alt="Original Fitness Club"
        className={`${imgSize} w-auto rounded-lg object-contain`}
      />
      <span className={`${textSize} font-black tracking-wider text-white`}>
        ORIGINAL <span className="text-[#D4AF37]">FIT</span>
      </span>
    </Link>
  );
}