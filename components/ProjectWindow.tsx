"use client";

import type { Project } from "@/lib/notion";
import Image from "next/image";
import { useState } from "react";

type ProjectWindowProps = {
  project: Project;
};

export default function ProjectWindow({ project }: ProjectWindowProps) {
  const [failed, setFailed] = useState(!project.imageUrl);

  const content = (
    <>
      <div className="relative mb-3 h-[100px] w-full overflow-hidden rounded-[3px] bg-[#2a2a2a]">
        {!failed ? (
          <Image
            src={project.imageUrl}
            alt=""
            fill
            sizes="180px"
            className="object-cover opacity-80 grayscale"
            onError={() => setFailed(true)}
          />
        ) : null}
      </div>
      <div className="mb-2 inline-flex rounded-full bg-white px-2 py-[3px] text-[9px] font-bold leading-none text-black">
        {project.tag}
      </div>
      <h2 className="text-[12px] leading-snug text-white/80">{project.title}</h2>
      <p className="mt-1 text-[10px] leading-normal text-white/35">
        {project.description}
      </p>
    </>
  );

  if (project.linkUrl) {
    return (
      <a href={project.linkUrl} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
