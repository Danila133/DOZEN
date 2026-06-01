type AppLogoProps = {
  size?: number;
  className?: string;
};

export function AppLogo({ size = 36, className = "" }: AppLogoProps) {
  return (
    <img
      src="/icon.svg"
      alt="DOZEN"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden
    />
  );
}
