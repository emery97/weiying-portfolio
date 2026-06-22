"use client";

const skills = [
  "Python",
  "FastAPI",
  "React",
  "RAG",
  "NLP",
  "Docker",
  "Notion",
];

export default function SkillsWindow() {
  return (
    <div className="flex w-[170px] flex-wrap">
      {skills.map((skill) => (
        <span
          key={skill}
          className="m-[2px] rounded-full border border-white/[0.15] px-2 py-[3px] text-[9px] leading-none text-white/60"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
