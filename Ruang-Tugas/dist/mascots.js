/* Each atlas has three columns. Expression order follows the supplied artwork. */
const RuangMascots = (() => {
  const characters = {
    lila: {
      name: 'Mytia', palette: 'Ungu dan biru', themeColor: ['#ebe4ff', '#242032'],
      expressions: ['Takjub', 'Memohon', 'Mengantuk', 'Khawatir', 'Capek', 'Iseng'],
      poses: { welcome: 5, tasks: 4, calendar: 3, subjects: 1, completed: 0, settings: 2, success: 0, focus: 1, deadline: 3 }
    },
    rimba: {
      name: 'Thignari', palette: 'Hijau dan mint', themeColor: ['#e1f1e5', '#162d26'],
      expressions: ['Senang', 'Marah', 'Sedih', 'Terkejut', 'Fokus', 'Malu-malu', 'Tertawa', 'Menangis', 'Khawatir', 'Bangga', 'Mengajar', 'Mengantuk'],
      poses: { welcome: 0, tasks: 4, calendar: 3, subjects: 10, completed: 9, settings: 5, success: 9, focus: 4, deadline: 8 }
    },
    ambar: {
      name: 'Albedo', palette: 'Jingga dan krem', themeColor: ['#fae8d5', '#32231f'],
      expressions: ['Senang', 'Marah', 'Sedih', 'Terkejut', 'Fokus', 'Malu-malu'],
      poses: { welcome: 5, tasks: 4, calendar: 3, subjects: 5, completed: 0, settings: 2, success: 0, focus: 4, deadline: 3 }
    }
  };
  const messages = {
    welcome: 'Siap menemani kamu belajar.',
    tasks: 'Ayo kerjakan satu tugas dulu.',
    calendar: 'Yuk, lihat jadwal berikutnya.',
    subjects: 'Mau belajar mapel apa hari ini?',
    completed: 'Lihat semua yang sudah kamu kerjakan!',
    settings: 'Atur ruang belajarmu sesukamu.',
    success: 'Satu tugas selesai! Kerja bagus.',
    focus: 'Ayo fokus. Satu tugas dulu.',
    deadline: 'Ada deadline dekat atau terlewat. Cek daftar tugasmu, yuk.'
  };
  const pageContexts = {
    beranda: 'welcome', tugas: 'tasks', kalender: 'calendar',
    mapel: 'subjects', selesai: 'completed', pengaturan: 'settings'
  };
  const idleDelay = 8000;
  const root = document.documentElement;
  const preferenceKey = 'ruang-tugas-mascot';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = Object.hasOwn(characters, root.dataset.mascot) ? root.dataset.mascot : 'lila';
  let activePage = 'beranda';
  let hasDeadline = false;
  let situation;
  let previewIndex;
  let idleFrame;
  let reactionTimer;
  let idleTimer;
  let lastActivity = Date.now();

  function paintPortrait(element, id, frame) {
    const state = id + ':' + frame;
    if (element.dataset.pose === state) return;
    element.dataset.pose = state;
    const rows = characters[id].expressions.length / 3;
    element.style.backgroundImage = `url("mascots/${id}.jpg")`;
    element.style.backgroundSize = `300% ${rows * 100}%`;
    element.style.backgroundPosition = `${frame % 3 * 50}% ${Math.floor(frame / 3) * 100 / (rows - 1)}%`;
  }

  function currentSituation() {
    if (situation) return situation;
    if (hasDeadline && (activePage === 'beranda' || activePage === 'kalender')) return 'deadline';
    return pageContexts[activePage];
  }

  function currentFrame() {
    return previewIndex ?? idleFrame ?? characters[selected].poses[currentSituation()];
  }

  function playScene(idle = false) {
    const pose = RuangMascotScenes[selected].frames[currentFrame()];
    RuangMascotScene.play(selected, pose, idle);
  }

  function render() {
    const character = characters[selected];
    const frame = currentFrame();
    const expression = character.expressions[frame];
    const message = previewIndex === undefined
      ? messages[currentSituation()]
      : 'Ekspresi ' + expression.toLocaleLowerCase('id-ID') + '.';
    RuangMascotScene.setPose(selected, RuangMascotScenes[selected].frames[frame]);
    for (const portrait of document.querySelectorAll('[data-mascot-current]')) {
      paintPortrait(portrait, selected, frame);
    }
    for (const name of document.querySelectorAll('[data-mascot-name]')) {
      if (name.textContent !== character.name) name.textContent = character.name;
    }
    for (const line of document.querySelectorAll('[data-mascot-message]')) {
      if (line.textContent !== message) line.textContent = message;
    }
    for (const option of document.querySelectorAll('[data-choose-mascot]')) {
      option.setAttribute('aria-pressed', String(option.dataset.chooseMascot === selected));
    }
  }

  function clearReaction() {
    clearTimeout(reactionTimer);
    situation = undefined;
    previewIndex = undefined;
    idleFrame = undefined;
  }

  function resetReaction() {
    clearReaction();
    render();
  }

  function react(next, duration = 4500) {
    clearReaction();
    markActivity();
    situation = next;
    render();
    playScene();
    reactionTimer = setTimeout(resetReaction, duration);
  }

  function showNext() {
    const next = (currentFrame() + 1) % characters[selected].expressions.length;
    clearReaction();
    markActivity();
    previewIndex = next;
    render();
    playScene();
    reactionTimer = setTimeout(resetReaction, 6000);
  }

  function syncColor(mode = root.dataset.theme) {
    document.querySelector('meta[name="theme-color"]').content = characters[selected].themeColor[mode === 'dark' ? 1 : 0];
  }

  function update(tasks, tomorrow, page) {
    hasDeadline = tasks.some(task => task.status !== 'selesai' && task.date <= tomorrow);
    const pageChanged = activePage !== page;
    if (pageChanged) {
      activePage = page;
      clearReaction();
      markActivity();
    }
    render();
    if (pageChanged) playScene();
  }

  function markActivity() {
    lastActivity = Date.now();
    if (idleFrame !== undefined) {
      idleFrame = undefined;
      RuangMascotScene.rest();
      render();
    }
  }

  function idleTick() {
    if (document.hidden || motion.matches) return;
    const remaining = idleDelay - (Date.now() - lastActivity);
    if (remaining > 0) {
      idleTimer = setTimeout(idleTick, remaining);
      return;
    }
    if (!situation && previewIndex === undefined && !document.querySelector('dialog[open]')) {
      const frame = currentFrame();
      const count = characters[selected].expressions.length;
      idleFrame = (frame + 1 + Math.floor(Math.random() * (count - 1))) % count;
      render();
      playScene(true);
    }
    idleTimer = setTimeout(idleTick, 5200 + Math.random() * 2300);
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    markActivity();
    if (!motion.matches && !document.hidden) idleTimer = setTimeout(idleTick, idleDelay);
  }

  const dialog = document.getElementById('mascot-dialog');
  const options = document.getElementById('mascot-options');
  for (const [id, character] of Object.entries(characters)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mascot-option';
    button.dataset.chooseMascot = id;
    button.innerHTML = `<span class="mascot-portrait" aria-hidden="true"></span><strong>${character.name}</strong><small>${character.palette}</small>`;
    paintPortrait(button.firstElementChild, id, character.poses.success);
    options.append(button);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-mascots]')) {
      dialog.showModal();
      return;
    }
    if (event.target.closest('[data-next-mascot-pose]')) {
      showNext();
      return;
    }
    const choice = event.target.closest('[data-choose-mascot]');
    if (!choice || !Object.hasOwn(characters, choice.dataset.chooseMascot)) return;
    selected = choice.dataset.chooseMascot;
    root.dataset.mascot = selected;
    try { localStorage.setItem(preferenceKey, selected); } catch {}
    syncColor();
    react('welcome', 1600);
  });
  document.addEventListener('pointerdown', markActivity, { passive: true });
  document.addEventListener('pointermove', markActivity, { passive: true });
  document.addEventListener('keydown', markActivity);
  document.addEventListener('scroll', markActivity, { capture: true, passive: true });
  document.addEventListener('visibilitychange', resetIdle);
  motion.addEventListener('change', resetIdle);
  render();
  syncColor();
  resetIdle();
  playScene();

  return { react, syncColor, update };
})();
