"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LocaleLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function LocaleLink({ href, className, children }: LocaleLinkProps) {
  const pathname = usePathname();
  const isPolish = pathname.startsWith("/pl");
  const prefix = isPolish ? "/pl" : "";

  return (
    <Link href={`${prefix}${href}`} className={className}>
      {children}
    </Link>
  );
}
