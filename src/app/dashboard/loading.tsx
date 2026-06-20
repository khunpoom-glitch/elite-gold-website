export default function DashboardLoading() {
  return (
    <section className="grid gap-6" aria-label="Loading member area">
      <div className="rounded-md border border-white/10 bg-black/70 p-5 sm:p-6">
        <div className="h-6 w-36 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-10 max-w-xl animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-4 max-w-2xl animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="rounded-md border border-white/10 bg-black/72 p-5" key={item}>
            <div className="size-6 animate-pulse rounded bg-gold/20" />
            <div className="mt-5 h-5 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
