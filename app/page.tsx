"use client";

import AboutWindow from "@/components/AboutWindow";
import DraggableWindow from "@/components/DraggableWindow";
import DrawCanvas from "@/components/DrawCanvas";
import ProjectWindow from "@/components/ProjectWindow";
import SkillsWindow from "@/components/SkillsWindow";
import Ticker from "@/components/Ticker";
import type { Project } from "@/lib/notion";
import { fallbackProjects } from "@/lib/notion";
import { useEffect, useState } from "react";

type VolunteerExperience = {
  id: string;
  title: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  techStack: string[];
  imageUrl: string;
};

const volunteerExperiences: VolunteerExperience[] = [
  {
    id: "blossom",
    title: "Blossom World Society — Youth Development",
    role: "Youth Volunteer Leader",
    organization: "Blossom World Society",
    period: "2022 - Present",
    description: "Led youth leadership camps, organized community values-driven campaigns, and mentored new volunteers.",
    techStack: ["Leadership", "Event Management", "Mentorship"],
    imageUrl: "/images/blossom.png",
  },
  {
    id: "minds",
    title: "MINDS — Intellectual Disabilities Care",
    role: "Activity Facilitator",
    organization: "Movement for the Intellectually Disabled of SG",
    period: "2023 - Present",
    description: "Facilitated developmental activities, life skills learning, and social integration games for beneficiaries.",
    techStack: ["Social Service", "Activity Facilitation", "Community Care"],
    imageUrl: "/images/minds.png",
  },
  {
    id: "lac-volunteer",
    title: "Little Acts Collective — Co-Founder",
    role: "Co-Founder & Tech Lead",
    organization: "Little Acts Collective",
    period: "2023 - Present",
    description: "Built online mutual-aid portals, managed social media, and coordinated local food-sharing and volunteer actions.",
    techStack: ["Product Management", "Community Organizing", "Next.js"],
    imageUrl: "/images/lac.png",
  }
];

type TimelineEvent = {
  title: string;
  role: string;
  date: string;
  desc: string;
  tech: string[];
};

const events: TimelineEvent[] = [
  {
    title: "NUS Hack&Roll 2025",
    role: "Participant & Team Lead",
    date: "Jan 2025",
    desc: "Built a collaborative browser extension for job application discovery in 24 hours.",
    tech: ["React", "Chrome Extension", "Node.js"]
  },
  {
    title: "TIL-AI NLP Challenge 2024",
    role: "Participant",
    date: "Oct 2024",
    desc: "Created a retrieval-augmented generation (RAG) system, scoring 0.898 in Q&A evaluations.",
    tech: ["Python", "RAG", "NLP"]
  },
  {
    title: "DSTA BrainHack 2024",
    role: "AI/ML Participant",
    date: "Jun 2024",
    desc: "Developed edge computer vision models for search-and-rescue applications.",
    tech: ["PyTorch", "YOLO", "Computer Vision"]
  }
];

export default function Home() {
  const [drawMode, setDrawMode] = useState(false);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);

  // Layout Toggle State Managers
  const [showProjects, setShowProjects] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Closed sub-widgets tracker
  const [closedProjects, setClosedProjects] = useState<string[]>([]);
  const [closedVolunteers, setClosedVolunteers] = useState<string[]>([]);

  // Mobile section states (accordion-like toggles)
  const [mobileSections, setMobileSections] = useState({
    about: true,
    projects: false,
    volunteer: false,
    events: false,
    stack: false,
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => setProjects(fallbackProjects));
  }, []);

  const getProjectPosition = (index: number) => {
    const xBase = 220; // Stagger after the left column shortcuts
    const yBase = 100;
    const xGap = 200;
    const yGap = 40;
    const col = index % 3;
    const row = Math.floor(index / 3);

    return {
      x: xBase + col * xGap,
      y: yBase + row * yGap + col * 20,
    };
  };

  const getVolunteerPosition = (index: number) => {
    const xBase = 260; // Cascade volunteers slightly offset from projects
    const yBase = 140;
    const xGap = 210;
    const col = index % 3;

    return {
      x: xBase + col * xGap,
      y: yBase + col * 20,
    };
  };

  const resetDesktop = () => {
    setShowProjects(false);
    setShowVolunteers(false);
    setShowEvents(false);
    setShowAbout(false);
    setClosedProjects([]);
    setClosedVolunteers([]);
  };

  return (
    <div className="portfolio-canvas relative h-dvh w-dvw overflow-hidden bg-[#0a0a0a] text-white">
      <div className="dot-grid absolute inset-0" />

      {/* Header Buttons */}
      <div className="absolute right-4 top-4 z-[100] hidden gap-2 md:flex">
        <button
          type="button"
          onClick={resetDesktop}
          className="rounded-[3px] border border-white/20 bg-[#0a0a0a]/80 px-3 py-2 text-[9px] text-white/50 hover:bg-white hover:text-black transition-colors"
        >
          🏠 HOME
        </button>
        <button
          type="button"
          onClick={() => setDrawMode((active) => !active)}
          className={`rounded-[3px] border border-white/20 px-3 py-2 text-[9px] ${drawMode
            ? "bg-white text-black"
            : "bg-[#0a0a0a]/80 text-white/50"
            }`}
        >
          ✏ DRAW
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("weiying-clear-drawing"))}
          className="rounded-[3px] border border-white/20 bg-[#0a0a0a]/80 px-3 py-2 text-[9px] text-white/50 hover:bg-white hover:text-black transition-colors"
        >
          ✕ CLEAR
        </button>
      </div>

      {/* Desktop OS Layout */}
      <div className="desktop-windows hidden md:block">
        {/* hello.txt (Open by default) */}
        <DraggableWindow
          id="hello-window"
          title="hello.txt"
          defaultPosition={{ x: "42%", y: 40 }}
          drawMode={drawMode}
        >
          <h1 className="text-[52px] font-bold leading-none tracking-[-2px] text-white">
            Hello
          </h1>
          <p className="mt-2 text-[10px] tracking-[0.15em] text-white/30">
            WEI YING · NUS CS · SG
          </p>
        </DraggableWindow>

        {/* Shortcuts column on the left */}
        {/* about.md shortcut */}
        <DraggableWindow
          id="about-shortcut"
          title="about.md"
          defaultPosition={{ x: 30, y: 40 }}
          drawMode={drawMode}
          onClick={() => {
            const nextState = !showAbout;
            setShowProjects(false);
            setShowVolunteers(false);
            setShowEvents(false);
            setShowAbout(nextState);
          }}
          className={`w-[130px] hover:border-white/40 transition-colors select-none ${showAbout ? "border-white/50 bg-white/5" : ""}`}
        >
          <div className="flex flex-col items-center justify-center py-1 cursor-pointer">
            <span className="text-[20px]">📝</span>
            <span className="mt-1 text-[9px] font-mono text-white/80">about.md</span>
          </div>
        </DraggableWindow>

        {/* projects.md shortcut */}
        <DraggableWindow
          id="projects-shortcut"
          title="projects.md"
          defaultPosition={{ x: 30, y: 140 }}
          drawMode={drawMode}
          onClick={() => {
            const nextState = !showProjects;
            setShowAbout(false);
            setShowVolunteers(false);
            setShowEvents(false);
            setShowProjects(nextState);
          }}
          className={`w-[130px] hover:border-white/40 transition-colors select-none ${showProjects ? "border-white/50 bg-white/5" : ""}`}
        >
          <div className="flex flex-col items-center justify-center py-1 cursor-pointer">
            <span className="text-[20px]">📂</span>
            <span className="mt-1 text-[9px] font-mono text-white/80">projects.md</span>
          </div>
        </DraggableWindow>

        {/* volunteer.md shortcut */}
        <DraggableWindow
          id="volunteer-shortcut"
          title="volunteer.md"
          defaultPosition={{ x: 30, y: 240 }}
          drawMode={drawMode}
          onClick={() => {
            const nextState = !showVolunteers;
            setShowProjects(false);
            setShowAbout(false);
            setShowEvents(false);
            setShowVolunteers(nextState);
          }}
          className={`w-[130px] hover:border-white/40 transition-colors select-none ${showVolunteers ? "border-white/50 bg-white/5" : ""}`}
        >
          <div className="flex flex-col items-center justify-center py-1 cursor-pointer">
            <span className="text-[20px]">🤝</span>
            <span className="mt-1 text-[9px] font-mono text-white/80">volunteer.md</span>
          </div>
        </DraggableWindow>

        {/* events.md shortcut */}
        <DraggableWindow
          id="events-shortcut"
          title="events.md"
          defaultPosition={{ x: 30, y: 340 }}
          drawMode={drawMode}
          onClick={() => {
            const nextState = !showEvents;
            setShowProjects(false);
            setShowAbout(false);
            setShowVolunteers(false);
            setShowEvents(nextState);
          }}
          className={`w-[130px] hover:border-white/40 transition-colors select-none ${showEvents ? "border-white/50 bg-white/5" : ""}`}
        >
          <div className="flex flex-col items-center justify-center py-1 cursor-pointer">
            <span className="text-[20px]">📅</span>
            <span className="mt-1 text-[9px] font-mono text-white/80">events.md</span>
          </div>
        </DraggableWindow>

        {/* stack.txt (skills list, open by default) */}
        <DraggableWindow
          id="stack-window"
          title="stack.txt"
          defaultPosition={{ x: 30, y: 440 }}
          drawMode={drawMode}
        >
          <SkillsWindow />
        </DraggableWindow>


        {/* Dynamic / Expandable Windows */}

        {/* about.md Detailed Window */}
        {showAbout && (
          <DraggableWindow
            id="about-detail-window"
            title="about_profile.md"
            defaultPosition={{ x: "calc(100vw - 320px)", y: 150 }}
            drawMode={drawMode}
            onClose={() => setShowAbout(false)}
          >
            <div className="w-[260px] text-[10px] leading-[1.7]">
              <div className="border-b border-white/10 pb-2 mb-3">
                <h2 className="text-[14px] font-bold text-white leading-none">Lee Wei Ying</h2>
                <p className="text-[9px] text-white/40 mt-1 font-mono">NUS COMPUTER SCIENCE STUDENT</p>
              </div>

              <div className="text-white/70 mb-3 space-y-2">
                <AboutWindow />
                <p>
                  I build web systems, experiment with HCI/BCI concepts, and organize local volunteer movements. Incoming NUS CS undergraduate aiming to merge software engineering with real-world accessibility.
                </p>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-2 text-white/50">
                <div>
                  <span className="text-white font-semibold">Focus Areas:</span>
                  <p className="text-[9px] pl-2 mt-0.5 font-mono">· Civic Tech & Inclusivity<br />· Web A11y & Systems<br />· Cognitive Workload AI</p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-2 flex justify-between items-center text-white/30 text-[8px] font-mono select-none">
                <span>LOC: SINGAPORE</span>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>
          </DraggableWindow>
        )}

        {/* projects.md Draggable Widgets Cascaded */}
        {showProjects && projects
          .filter(project => !closedProjects.includes(project.id))
          .map((project, index) => {
            const pos = getProjectPosition(index);
            return (
              <DraggableWindow
                key={project.id}
                id={`project-widget-${project.id}`}
                title={`${project.title.toLowerCase().replace(/\s/g, '_')}.project`}
                defaultPosition={{ x: pos.x, y: pos.y }}
                drawMode={drawMode}
                onClose={() => setClosedProjects(prev => [...prev, project.id])}
              >
                <div className="w-[180px]">
                  <ProjectWindow project={project} />
                </div>
              </DraggableWindow>
            );
          })}

        {/* volunteer.md Draggable Widgets Cascaded */}
        {showVolunteers && volunteerExperiences
          .filter(exp => !closedVolunteers.includes(exp.id))
          .map((exp, index) => {
            const pos = getVolunteerPosition(index);
            return (
              <DraggableWindow
                key={exp.id}
                id={`volunteer-widget-${exp.id}`}
                title={`${exp.id}.volunteer`}
                defaultPosition={{ x: pos.x, y: pos.y }}
                drawMode={drawMode}
                onClose={() => setClosedVolunteers(prev => [...prev, exp.id])}
              >
                <div className="w-[180px] flex flex-col h-full">
                  <div className="mb-2 flex flex-wrap gap-1">
                    {exp.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-[3px] border border-white/10 bg-white/[0.04] px-[6px] py-[2px] text-[8px] font-bold leading-none text-white/60 tracking-wider uppercase"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-[12px] font-bold leading-snug text-white/90">{exp.title}</h2>
                  <p className="text-[9px] text-white/40 font-mono mt-0.5">{exp.role} · {exp.period}</p>
                  <p className="mt-2 text-[10px] leading-normal text-white/35">
                    {exp.description}
                  </p>
                </div>
              </DraggableWindow>
            );
          })}

        {/* events.md Big Widget with Vertical Timeline */}
        {showEvents && (
          <DraggableWindow
            id="events-window"
            title="events_timeline.md"
            defaultPosition={{ x: "32%", y: 110 }}
            drawMode={drawMode}
            onClose={() => setShowEvents(false)}
          >
            <div className="w-[320px] md:w-[350px] max-h-[400px] overflow-y-auto pr-1">
              <h2 className="text-[14px] font-bold text-white mb-4 border-b border-white/10 pb-2">
                Events & Competitions
              </h2>
              <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6 py-2">
                {events.map((evt, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[31px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/30 bg-[#0a0a0a]">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>

                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider">{evt.date}</span>
                    <h3 className="text-[11px] font-bold text-white/90 mt-0.5 leading-snug">{evt.title}</h3>
                    <p className="text-[9px] text-white/50 font-mono mb-1">{evt.role}</p>
                    <p className="text-[10px] text-white/35 leading-normal">{evt.desc}</p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {evt.tech.map(t => (
                        <span key={t} className="text-[8px] px-1.5 py-[1px] border border-white/10 rounded-[3px] text-white/40">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DraggableWindow>
        )}
      </div>

      {/* Mobile Stack Layout */}
      <main className="mobile-stack relative z-20 flex h-full flex-col gap-4 overflow-y-auto p-4 pb-16 md:hidden">
        {/* Hello header */}
        <section className="window-static">
          <div className="window-title">hello.txt</div>
          <div className="p-3">
            <h1 className="text-[52px] font-bold leading-none tracking-[-2px]">
              Hello
            </h1>
            <p className="mt-2 text-[10px] tracking-[0.15em] text-white/30">
              WEI YING · NUS CS · SG
            </p>
          </div>
        </section>

        {/* about.md Section */}
        <section className="window-static overflow-hidden">
          <button
            type="button"
            className="window-title flex w-full justify-between items-center text-left"
            onClick={() => setMobileSections(prev => ({ ...prev, about: !prev.about }))}
          >
            <span>📝 about.md</span>
            <span>{mobileSections.about ? "▼" : "▶"}</span>
          </button>
          {mobileSections.about && (
            <div className="p-3 text-[10px] leading-[1.7] border-t border-white/[0.05]">
              <AboutWindow />
              <p className="mt-2 text-white/40">
                Incoming NUS Computer Science undergraduate with a passion for web engineering, civic technology, and creating digital interfaces that make volunteering accessible for all.
              </p>
            </div>
          )}
        </section>

        {/* projects.md Section */}
        <section className="window-static overflow-hidden">
          <button
            type="button"
            className="window-title flex w-full justify-between items-center text-left"
            onClick={() => setMobileSections(prev => ({ ...prev, projects: !prev.projects }))}
          >
            <span>📂 projects.md</span>
            <span>{mobileSections.projects ? "▼" : "▶"}</span>
          </button>
          {mobileSections.projects && (
            <div className="p-3 border-t border-white/[0.05] flex flex-col gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0">
                  <ProjectWindow project={project} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* volunteer.md Section */}
        <section className="window-static overflow-hidden">
          <button
            type="button"
            className="window-title flex w-full justify-between items-center text-left"
            onClick={() => setMobileSections(prev => ({ ...prev, volunteer: !prev.volunteer }))}
          >
            <span>🤝 volunteer.md</span>
            <span>{mobileSections.volunteer ? "▼" : "▶"}</span>
          </button>
          {mobileSections.volunteer && (
            <div className="p-3 border-t border-white/[0.05] flex flex-col gap-4 text-[10px]">
              {volunteerExperiences.map((exp) => (
                <div key={exp.id} className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0">
                  <h3 className="font-bold text-white text-[12px]">{exp.title}</h3>
                  <p className="text-white/40 text-[9px] font-mono mt-0.5">{exp.role} · {exp.period}</p>
                  <p className="text-white/35 mt-2 leading-relaxed">{exp.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.techStack.map(t => (
                      <span key={t} className="text-[8px] px-1.5 py-[1px] border border-white/10 rounded-[3px] text-white/40">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* events.md Section */}
        <section className="window-static overflow-hidden">
          <button
            type="button"
            className="window-title flex w-full justify-between items-center text-left"
            onClick={() => setMobileSections(prev => ({ ...prev, events: !prev.events }))}
          >
            <span>📅 events.md</span>
            <span>{mobileSections.events ? "▼" : "▶"}</span>
          </button>
          {mobileSections.events && (
            <div className="p-3 border-t border-white/[0.05]">
              <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6 py-2">
                {events.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/30 bg-[#0a0a0a]">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider">{evt.date}</span>
                    <h3 className="text-[11px] font-bold text-white/90 mt-0.5 leading-snug">{evt.title}</h3>
                    <p className="text-[9px] text-white/50 font-mono mb-1">{evt.role}</p>
                    <p className="text-[10px] text-white/35 leading-normal">{evt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* stack.txt Section */}
        <section className="window-static overflow-hidden">
          <button
            type="button"
            className="window-title flex w-full justify-between items-center text-left"
            onClick={() => setMobileSections(prev => ({ ...prev, stack: !prev.stack }))}
          >
            <span>💻 stack.txt</span>
            <span>{mobileSections.stack ? "▼" : "▶"}</span>
          </button>
          {mobileSections.stack && (
            <div className="p-3 border-t border-white/[0.05]">
              <SkillsWindow />
            </div>
          )}
        </section>

        {/* Guestbook button */}
        <button
          type="button"
          className="window-static p-6 text-center"
          onClick={() => setGuestbookOpen(true)}
        >
          <div className="text-[32px] leading-none">♡</div>
          <div className="mt-2 text-[9px] tracking-[0.15em] text-white/30">
            GUEST BOOK
          </div>
        </button>
      </main>

      <DrawCanvas active={drawMode} />

      <div className="pointer-events-none absolute bottom-4 left-4 z-30 text-[9px] text-white/20">
        MADE IN SINGAPORE, WITH LOVE
      </div>
    </div>
  );
}
