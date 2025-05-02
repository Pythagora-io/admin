import { cn } from "@/lib/utils";

interface BackgroundImageProps {
  className?: string;
}

export function BackgroundImage({ className }: BackgroundImageProps) {
  return (
    <>
      {/* Full background image with blur */}
      <div
        className={cn(
          "fixed inset-0 w-[95%] h-[95%] m-auto -z-10 bg-cover bg-center rounded-xl",
          className
        )}
        style={{
          backgroundImage: "url('/images/abstract-bg.jpg')",
          filter: "blur(8px)",
          opacity: 0.15
        }}
      />
      
      {/* Non-blurred border area (5% on each side) */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/abstract-bg.jpg')",
          opacity: 0.1
        }}
      />
    </>
  );
}