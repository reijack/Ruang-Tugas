/* Theme only; tasks and photos remain in IndexedDB. Avoid a light flash on reload. */
try{if(localStorage.getItem('ruang-tugas-theme')==='dark')document.documentElement.dataset.theme='dark';}catch{}
