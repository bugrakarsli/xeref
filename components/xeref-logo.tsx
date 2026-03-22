import Image from 'next/image';

export function XerefLogo({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image src="/xeref-ai-logo.jpg" alt="xeref.ai logo" fill className="object-contain" />
    </div>
  );
}
