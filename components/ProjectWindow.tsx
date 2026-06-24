"use client";

import { Project } from "@/lib/backend/models/project.model";
import Image from "next/image";
import { useState } from "react";

type ProjectWindowProps = {
  project: Project;
};

export default function ProjectWindow({ project }: ProjectWindowProps) {
  const [failed, setFailed] = useState(!project.imageUrl);

  const displayTags = project.techStack ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3 h-[100px] w-full overflow-hidden rounded-[3px] bg-[#2a2a2a]">
        {!failed ? (
          <Image
            src={project.imageUrl}
            alt=""
            fill
            sizes="180px"
            className="object-cover opacity-80 grayscale transition-all hover:scale-105 hover:opacity-100 hover:grayscale-0 duration-300"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/20 select-none">
            no preview
          </div>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {displayTags.map((tech) => (
          <span
            key={tech}
            className="rounded-[3px] border border-white/10 bg-white/[0.04] px-[6px] py-[2px] text-[8px] font-bold leading-none text-white/60 tracking-wider uppercase"
          >
            {tech}
          </span>
        ))}
      </div>

      <h2 className="text-[12px] font-bold leading-snug text-white/90">{project.title}</h2>

      <p className="mt-1 text-[10px] leading-normal text-white/35 flex-grow">
        {project.description}
      </p>

      {(project.githubLink || project.demoLink) && (
        <div className="mt-3 flex gap-2 border-t border-white/[0.08] pt-2">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-white/15 bg-white/[0.02] px-2 py-1 text-[8px] text-white/50 hover:bg-white hover:text-black transition-all font-mono"
            >
              git ↗
            </a>
          )}
          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-white/15 bg-white/[0.02] px-2 py-1 text-[8px] text-white/50 hover:bg-white hover:text-black transition-all font-mono"
            >
              demo ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
