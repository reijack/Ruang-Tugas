/* Apply saved visual preferences before the stylesheet paints. */
try {
  const root = document.documentElement;
  if (localStorage.getItem('ruang-tugas-theme') === 'dark') root.dataset.theme = 'dark';
  const mascot = localStorage.getItem('ruang-tugas-mascot');
  if (['lila', 'rimba', 'ambar'].includes(mascot)) root.dataset.mascot = mascot;
} catch {}
