"use client";

import { useState } from "react";
import { ArtificialChart03MechanicalReproduction } from "@/components/artificial/chart03/ArtificialChart03MechanicalReproduction";
import { ArtificialChart03Succession } from "@/components/artificial/chart03/ArtificialChart03Succession";
import { ArtificialChart03CompoundExpansion } from "@/components/artificial/chart03/ArtificialChart03CompoundExpansion";
import type { Chart03Hover } from "@/components/artificial/chart03/chart03Shared";

export function ArtificialChart03InteractiveSuite() {
  const [activeHover, setActiveHover] = useState<Chart03Hover | null>(null);

  return (
    <>
      <ArtificialChart03MechanicalReproduction activeHover={activeHover} onHover={setActiveHover} />

      <div className="mx-auto mt-7 w-full">
        <ArtificialChart03Succession activeHover={activeHover} onHover={setActiveHover} />
      </div>

      <div className="mx-auto mt-12 grid w-full gap-8 border-t border-ink/90 pt-8 sm:pt-9 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-8 lg:pt-10">
        <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-fire">
          03 / mechanical reproduction — part ii
        </p>
        <div className="min-w-0">
          <div className="mb-8 max-w-5xl">
            <h3 className="text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
              Artificial as the Reproduced Experience
            </h3>
            <p className="mt-2 max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              Part II tracks artificial as a travelling prefix after reproduction becomes cultural infrastructure: it moves from light and colour into materials, bodies, cognition, and social performance.
            </p>
          </div>

          <section className="w-full">
            <ArtificialChart03CompoundExpansion activeHover={activeHover} onHover={setActiveHover} />
          </section>
        </div>
      </div>
    </>
  );
}
