export default function Loading() {
  return (
    <main className="page" aria-busy="true" aria-label="Carregando métricas">
      <div className="skel skel-band" />
      <div className="skel skel-chart" />
      <div className="skel skel-table" />
    </main>
  );
}
