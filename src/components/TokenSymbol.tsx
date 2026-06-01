import { LogoLetterD } from "@/components/LogoLetterD";

type TokenSymbolProps = {
  className?: string;
  /** Logo A height in px */
  logoSize?: number;
  dollarClassName?: string;
};

/** $D with logo-style D (not plain text) */
export function TokenSymbol({
  className = "",
  logoSize = 11,
  dollarClassName = "",
}: TokenSymbolProps) {
  return (
    <span
      className={`uni-token-symbol inline-flex items-end gap-px leading-none ${className}`.trim()}
      aria-label="$D"
    >
      <span className={`uni-token-dollar ${dollarClassName}`.trim()}>$</span>
      <LogoLetterD size={logoSize} className="uni-token-logo-a shrink-0" />
    </span>
  );
}
