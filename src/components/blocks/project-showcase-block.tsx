import Link from "next/link";
import Image from "next/image";

interface ProjectData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
}

export function ProjectShowcaseBlock({
  project,
  index,
  locale,
}: {
  project: ProjectData;
  index: number;
  locale: string;
}) {
  const isReversed = index % 2 === 1;
  const prefix = locale === "pl" ? "/pl" : "";
  const num = String(index + 1).padStart(2, "0");

  const textBlock = (
    <div className="flex-1">
      <span className="font-mono text-xs text-accent">{num}</span>
      <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
      {project.description && (
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {project.description}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-spring text-sm border border-border px-4 py-2 hover:border-accent/50 rounded-sm"
          >
            View Live
          </a>
        )}
        <Link
          href={`${prefix}/projects/${project.slug}`}
          className="btn-spring text-sm border border-border px-4 py-2 hover:border-accent/50 rounded-sm"
        >
          Case Study
        </Link>
      </div>
    </div>
  );

  const imageSrc = project.coverImage || project.imageUrl;

  const imageBlock = (
    <div className="flex-1 w-full">
      <div className="card-frame border border-border rounded-sm aspect-video bg-background overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={project.title}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-sm text-muted/40">{project.slug}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col ${isReversed ? "sm:flex-row-reverse" : "sm:flex-row"} items-center gap-10 sm:gap-16`}>
      {textBlock}
      {imageBlock}
    </div>
  );
}
