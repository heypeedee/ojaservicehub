import logoAsset from "@/assets/oja-logo.png.asset.json";

type Props = {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function OjaLogo({
  size = 36,
  className = "",
  showWordmark = true,
  wordmarkClassName = "text-lg font-semibold tracking-tight text-foreground",
}: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoAsset.url}
        alt="Ọjà"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {showWordmark && <span className={wordmarkClassName}>Ọjà</span>}
    </span>
  );
}

export default OjaLogo;
