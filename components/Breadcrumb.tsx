import Link from "next/link";

interface BreadcrumbProps {
  paths: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumb({ paths }: BreadcrumbProps) {
  return (
    <nav className="flex items-center justify-center space-x-2 text-[13px] tracking-wider font-medium uppercase mt-4">
      <Link href="/" className="text-white hover:text-accent border-b border-transparent hover:border-accent pb-1 transition-colors">
        Home
      </Link>
      <span className="text-white/60">›</span>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        
        return (
          <div key={path.label} className="flex items-center space-x-2">
            {isLast || !path.href ? (
              <span className="text-white/80 border-b border-white/30 pb-1">
                {path.label}
              </span>
            ) : (
              <Link href={path.href} className="text-white hover:text-accent border-b border-transparent hover:border-accent pb-1 transition-colors">
                {path.label}
              </Link>
            )}
            <span className="text-white/60">›</span>
          </div>
        );
      })}
    </nav>
  );
}
