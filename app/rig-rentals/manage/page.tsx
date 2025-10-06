export const metadata = {
  title: "Rig Rentals ⛏️ | Manage",
};

export default function ManageRigPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0b0f13" }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-black/30" style={{ borderColor: "rgba(0,255,178,0.2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: "#e0e0e0" }}>
            Rig Rentals ⛏️ | <span className="text-[#00ffb2]">Manage</span>
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,178,0.2)" }}>
          <p className="text-[#e0e0e0]">
            Coming soon: Create and manage rigs here. This page will let you add rigs, set algorithms, pricing, and monitor status in real time.
          </p>
        </div>
      </main>
    </div>
  );
}
