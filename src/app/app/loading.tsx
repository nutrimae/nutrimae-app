export default function AppLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md animate-pulse flex-col gap-3.5 px-5 pb-24 pt-4" aria-label="Carregando página">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-primary-100" />
        <div className="space-y-2"><div className="h-5 w-36 rounded-full bg-primary-100" /><div className="h-3 w-28 rounded-full bg-primary-50" /></div>
      </div>
      <div className="h-[76px] rounded-[18px] bg-white shadow-subtle" />
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((item) => <div key={item} className="h-[60px] rounded-[16px] bg-white shadow-subtle" />)}</div>
      <div className="h-[260px] rounded-[20px] bg-white shadow-subtle" />
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((item) => <div key={item} className="h-[142px] rounded-[18px] bg-primary-50" />)}</div>
    </main>
  );
}
