interface BlogGridProps {
  children: React.ReactNode;
}

// Two columns, with the newest post spanning both: a small archive fills the
// rows instead of leaving holes, and it still reads as a grid once it grows.
export function BlogGrid({ children }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{children}</div>
  );
}
