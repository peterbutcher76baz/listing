"use client";

export function PrintStrategyButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex h-[48px] w-[200px] items-center justify-center rounded-md border-2 border-[#003366] bg-transparent text-sm font-medium text-[#003366] font-sans hover:bg-[#003366]/5 transition-colors"
    >
      Print Strategy
    </button>
  );
}
