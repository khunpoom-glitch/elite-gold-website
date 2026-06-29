export default function DashboardLoading() {
  return (
    <section className="min-h-dvh w-full" aria-label="Loading member area">
      <div className="sticky top-0 z-20 grid min-h-16 gap-3 border-b border-white/8 bg-[#1D1D1D]/96 px-4 py-3 backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)_auto] sm:items-center">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-white/8" />
        <div className="hidden h-10 animate-pulse rounded-xl bg-white/8 sm:block" />
        <div className="h-10 w-20 animate-pulse rounded-full bg-white/8" />
      </div>

      <div className="grid gap-5 p-4 sm:p-6">
        <section className="grid gap-5 lg:grid-cols-2" aria-hidden="true">
          <div className="min-h-40 animate-pulse rounded-2xl border border-white/7 bg-[#171717]" />
          <div className="min-h-40 animate-pulse rounded-2xl border border-white/7 bg-[#171717]" />
        </section>
        <div className="min-h-80 animate-pulse rounded-2xl border border-white/7 bg-[#171717]" />
      </div>
    </section>
  );
}
