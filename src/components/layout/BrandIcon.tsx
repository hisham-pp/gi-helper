interface BrandIconProps {
  /** Intrinsic size hint in px; set the rendered size with `className`. */
  size?: number;
  className?: string;
}

/**
 * The GI Helper icon: the same image as the browser tab and app icons, all
 * generated from scripts/brand/icon-source by `pnpm build:brand-icons`.
 * The 192px file stays sharp up to 64px on 3x screens.
 */
export function BrandIcon({ size = 32, className = "" }: BrandIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/icon-192.png" alt="" width={size} height={size} draggable={false} className={className} />
  );
}
