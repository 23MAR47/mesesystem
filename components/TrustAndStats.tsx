export default function TrustAndStats() {
  return (
    <section className="border-y border-zinc-200 bg-[#f6f4ef]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="font-medium text-zinc-800">Türkiye’den, Türkiye’nin her yerine.</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-zinc-500">
          <span>Web sitesi</span>
          <span aria-hidden="true">/</span>
          <span>E-ticaret</span>
          <span aria-hidden="true">/</span>
          <span>Mobil uygulama</span>
          <span aria-hidden="true">/</span>
          <span>Özel yazılım</span>
        </div>
      </div>
    </section>
  )
}
