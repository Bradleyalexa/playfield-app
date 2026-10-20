"use client";

import { Navbar } from "../../components/common/Navbar";
import { SportGuideView } from "../../components/education/SportGuideView";

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-10">
        <SportGuideView />
      </main>
    </div>
  );
}
