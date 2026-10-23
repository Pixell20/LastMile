export function exportSnapshot(sim) {
  const href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sim, null, 2));
  const a = document.createElement('a');
  a.href = href;
  a.download = 'lastmile_simulation_snapshot.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
