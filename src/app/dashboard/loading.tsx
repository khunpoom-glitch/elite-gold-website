export default function DashboardLoading() {
  return (
    <section className="grid gap-6" aria-label="Loading member area">
      <div className="member-surface p-5 sm:p-7">
        <div className="h-7 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-4 h-4 max-w-2xl animate-pulse rounded-full bg-white/10" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="border-t border-white/10 pt-3" key={item}>
              <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-28 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="member-surface-soft p-5" key={item}>
            <div className="size-6 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-5 h-5 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
