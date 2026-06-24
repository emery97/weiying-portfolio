"use client";

import { Journey } from "@/lib/backend/models/journey.model";

type JourneyWidgetProps = {
  journeys: Journey[];
};

function formatMonthYear(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function JourneyWidget({ journeys }: JourneyWidgetProps) {
  const sortedJourneys = [...journeys].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div className="w-[320px] md:w-[360px] max-h-[420px] overflow-y-auto pr-1">
      <h2 className="mb-4 border-b border-white/10 pb-2 text-[14px] font-bold text-white">
        Journey
      </h2>

      <div className="relative ml-3 space-y-6 border-l border-white/10 py-2 pl-6">
        {sortedJourneys.map((journey) => {
          const start = formatMonthYear(journey.startDate);
          const end = formatMonthYear(journey.endDate);
          const period = [start, end].filter(Boolean).join(" - ");

          return (
            <article key={journey.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/30 bg-[#0a0a0a]">
                <span className="h-1 w-1 rounded-full bg-white" />
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">
                  {period || "Now"}
                </span>
                {journey.tag && (
                  <span className="rounded-[3px] border border-white/10 px-1.5 py-[1px] text-[8px] uppercase text-white/40">
                    {journey.tag}
                  </span>
                )}
              </div>

              <h3 className="mt-1 text-[12px] font-bold leading-snug text-white/90">
                {journey.title}
              </h3>
              {journey.location && (
                <p className="mt-0.5 font-mono text-[9px] text-white/50">
                  {journey.location}
                </p>
              )}
              <p className="mt-2 text-[10px] leading-normal text-white/35">
                {journey.description}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
