"use client";

import { Navbar } from "../../components/common/Navbar";
import { SportGuideView } from "../../components/education/SportGuideView";

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-3.5 sm:px-6 py-5 sm:py-10 pb-28 sm:pb-10">
        <SportGuideView />
      </main>
    </div>
  );
}
