"use client";

import AboutWindow from "@/components/AboutWindow";
import DraggableWindow from "@/components/DraggableWindow";
import DrawCanvas from "@/components/DrawCanvas";
import ProjectWindow from "@/components/ProjectWindow";
import SkillsWindow from "@/components/SkillsWindow";
import Ticker from "@/components/Ticker";
import type { Project } from "@/lib/notion";
import { fallbackProjects } from "@/lib/notion";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [drawMode, setDrawMode] = useState(false);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [visits, setVisits] = useState(1);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => setProjects(fallbackProjects));

    fetch("/api/visits", { method: "POST" })
      .then((response) => response.json())
      .then((data) => setVisits(Number(data.count) || 1))
      .catch(() => setVisits(1));
  }, []);

  const projectByOrder = useMemo(() => {
    const sorted = [...projects].sort((a, b) => a.order - b.order);
    return {
      ocli: sorted[0] ?? fallbackProjects[0],
      linked: sorted[1] ?? fallbackProjects[1],
      lac: sorted[2] ?? fallbackProjects[2],
    };
  }, [projects]);

  return (
    <div className="portfolio-canvas relative h-dvh w-dvw overflow-hidden bg-[#0a0a0a] text-white">
      <div className="dot-grid absolute inset-0" />

      <div className="absolute right-4 top-4 z-[100] hidden gap-2 md:flex">
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
          className="rounded-[3px] border border-white/20 bg-[#0a0a0a]/80 px-3 py-2 text-[9px] text-white/50"
        >
          ✕ CLEAR
        </button>
      </div>

      <div className="desktop-windows hidden md:block">
        <DraggableWindow
          id="hello-window"
          title="hello.txt"
          defaultPosition={{ x: "40%", y: 40 }}
          drawMode={drawMode}
        >
          <h1 className="text-[52px] font-bold leading-none tracking-[-2px] text-white">
            Hello
          </h1>
          <p className="mt-2 text-[10px] tracking-[0.15em] text-white/30">
            WEI YING · NUS CS · SG
          </p>
        </DraggableWindow>

        <DraggableWindow
          id="news-window"
          title="news.scroll"
          defaultPosition={{ x: "30%", y: "calc(100vh - 86px)" }}
          bodyClassName="px-0"
          drawMode={drawMode}
        >
          <Ticker />
        </DraggableWindow>

        <DraggableWindow
          id="ocli-window"
          title="ocli.project"
          defaultPosition={{ x: 30, y: 200 }}
          drawMode={drawMode}
        >
          <div className="w-[180px]">
            <ProjectWindow project={projectByOrder.ocli} />
          </div>
        </DraggableWindow>

        <DraggableWindow
          id="linked-window"
          title="linked.project"
          defaultPosition={{ x: "calc(100vw - 210px)", y: 180 }}
          drawMode={drawMode}
        >
          <div className="w-[180px]">
            <ProjectWindow project={projectByOrder.linked} />
          </div>
        </DraggableWindow>

        <DraggableWindow
          id="about-window"
          title="about.md"
          defaultPosition={{ x: "calc(100vw - 230px)", y: 320 }}
          drawMode={drawMode}
        >
          <AboutWindow />
        </DraggableWindow>

        <DraggableWindow
          id="stack-window"
          title="stack.txt"
          defaultPosition={{ x: 30, y: 430 }}
          drawMode={drawMode}
        >
          <SkillsWindow />
        </DraggableWindow>

        <DraggableWindow
          id="volunteer-window"
          title="volunteer.md"
          defaultPosition={{ x: 220, y: 400 }}
          drawMode={drawMode}
        >
          <div className="w-[180px]">
            <ProjectWindow project={projectByOrder.lac} />
          </div>
        </DraggableWindow>
      </div>

      <main className="mobile-stack relative z-20 flex h-full flex-col gap-4 overflow-y-auto p-4 pb-16 md:hidden">
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
        {[projectByOrder.ocli, projectByOrder.linked, projectByOrder.lac].map(
          (project) => (
            <section key={project.id} className="window-static">
              <div className="window-title">{project.id}.project</div>
              <div className="p-3">
                <ProjectWindow project={project} />
              </div>
            </section>
          ),
        )}
        <section className="window-static">
          <div className="window-title">about.md</div>
          <div className="p-3">
            <AboutWindow />
          </div>
        </section>
        <section className="window-static">
          <div className="window-title">stack.txt</div>
          <div className="p-3">
            <SkillsWindow />
          </div>
        </section>
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
        <section className="window-static overflow-hidden">
          <div className="window-title">news.scroll</div>
          <div className="p-3">
            <Ticker />
          </div>
        </section>
      </main>

      <DrawCanvas active={drawMode} />

      <div className="pointer-events-none absolute bottom-4 left-4 z-30 text-[9px] text-white/20">
        MADE IN SINGAPORE, WITH LOVE
      </div>
    </div>
  );
}
