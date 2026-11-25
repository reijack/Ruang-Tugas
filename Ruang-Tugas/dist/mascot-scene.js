const RuangMascotScene = (() => {
  const stage = document.querySelector('.mascot-glance');
  const track = stage.querySelector('.mascot-scene-track');
  const actor = stage.querySelector('.mascot-scene-actor');
  const facing = stage.querySelector('.mascot-scene-facing');
  const shadow = stage.querySelector('.mascot-scene-shadow');
  const sprite = stage.querySelector('.mascot-scene-sprite');
  const outgoing = stage.querySelector('.mascot-scene-outgoing');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const center = 50;
  const sideStops = { L: 20, R: 80 };
  let character;
  let defaultPose;
  let position = center;
  let generation = 0;
  let pending;
  let movement;
  let requestedSource;
  let blend = [];

  function cancelBlend() {
    for (const animation of blend) animation.cancel();
    blend = [];
  }

  function show(pose, animate = true) {
    const src = `mascots/scenes/${character}-${pose}.webp`;
    if (!animate || motion.matches || !sprite.animate) {
      requestedSource = src;
      cancelBlend();
      if (sprite.getAttribute('src') !== src) sprite.src = src;
      return;
    }
    if (src === requestedSource) return;
    requestedSource = src;
    if (sprite.getAttribute('src') === src) return;

    const next = new Image();
    next.src = src;
    next.decode().then(() => {
      if (src !== requestedSource || sprite.getAttribute('src') === src) return;
      cancelBlend();
      const hasPrevious = sprite.naturalWidth > 0;
      if (hasPrevious) outgoing.src = sprite.src;
      sprite.src = src;
      if (!hasPrevious || document.hidden || motion.matches) return;
      blend = [
        sprite.animate([
          { opacity: .15, transform: 'translateY(2%) scale(.98)' },
          { opacity: 1, transform: 'translateY(-1%) scale(1.025)', offset: .66 },
          { opacity: 1, transform: 'none' }
        ], { duration: 270, easing: 'cubic-bezier(.22,1,.36,1)' }),
        outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-out' })
      ];
    }).catch(() => {
      if (requestedSource === src) requestedSource = undefined;
    });
  }

  function wait(duration) {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        pending = undefined;
        resolve();
      }, duration);
      pending = { timer, resolve };
    });
  }

  function look(direction) {
    facing.dataset.direction = direction;
  }

  function translate(percent) {
    return `translateX(${(percent - center) * .47}%)`;
  }

  function stop() {
    generation++;
    if (pending) {
      const { timer, resolve } = pending;
      clearTimeout(timer);
      pending = undefined;
      resolve();
    }
    if (movement) {
      const progress = movement.travel.effect.getComputedTiming().progress ?? 0;
      position += (movement.target - position) * progress;
      track.style.transform = translate(position);
      movement.animations.forEach(animation => animation.cancel());
      movement = undefined;
    }
    look('F');
  }

  function setPose(id, pose) {
    if (character === id && defaultPose === pose) return;
    stop();
    if (character !== id) {
      character = id;
      stage.dataset.character = id;
      position = center;
      track.style.transform = '';
    }
    defaultPose = pose;
    show(pose);
  }

  function footsteps(count) {
    const neutral = 'translateY(0%) rotate(0deg) scale(1,1)';
    const bodyFrames = [{ transform: neutral, offset: 0, easing: 'ease-out' }];
    const shadowFrames = [{ transform: 'scale(1)', opacity: .84, offset: 0 }];
    for (let step = 0; step < count; step++) {
      const apex = (step + .47) / count;
      const landing = (step + 1) / count;
      const lean = step % 2 ? -2.8 : 2.8;
      bodyFrames.push(
        { transform: `translateY(-6%) rotate(${lean}deg) scale(1,1.025)`, offset: apex, easing: 'ease-in' },
        { transform: landing === 1 ? neutral : 'translateY(0%) rotate(0deg) scale(1.025,.97)', offset: landing, easing: 'ease-out' }
      );
      shadowFrames.push(
        { transform: 'scale(.73)', opacity: .43, offset: apex },
        { transform: 'scale(1)', opacity: .84, offset: landing }
      );
    }
    return { bodyFrames, shadowFrames };
  }

  async function walk(target, run) {
    target = Math.max(sideStops.L, Math.min(sideStops.R, target));
    const distance = Math.abs(target - position);
    if (distance < .25) return;
    const duration = Math.min(1120, 310 + distance * 17);
    look(target > position ? 'R' : 'L');
    const travel = track.animate(
      [{ transform: translate(position) }, { transform: translate(target) }],
      { duration, easing: 'cubic-bezier(.4,.02,.3,1)', fill: 'forwards' }
    );
    const { bodyFrames, shadowFrames } = footsteps(Math.max(1, Math.round(duration / 320)));
    const step = actor.animate(bodyFrames, duration);
    const shade = shadow.animate(shadowFrames, duration);
    const animations = [travel, step, shade];
    movement = { travel, target, animations };
    await travel.finished.catch(() => {});
    if (run !== generation) return;
    position = target;
    track.style.transform = translate(position);
    animations.forEach(animation => animation.cancel());
    movement = undefined;
  }

  async function play(id, pose, idle) {
    stop();
    if (document.hidden || motion.matches || !track.animate) {
      show(pose, false);
      return;
    }
    const run = generation;
    const scene = RuangMascotScenes[id].scenes.find(item => item.pose === pose || item.actions.includes('e:' + pose));
    const hasTravel = scene.actions.some(action => action.startsWith('w') && Number(action.slice(1)) !== center);
    stage.dataset.scene = scene.name;
    show(idle ? scene.pose : pose);
    for (const action of scene.actions) {
      if (run !== generation) return;
      if (action.startsWith('w')) await walk(Number(action.slice(1)), run);
      else if (action.startsWith('p')) await wait(Math.min(1050, Number(action.slice(1))));
      else if (action.startsWith('e:')) show(action.slice(2));
      else if (!hasTravel && Object.hasOwn(sideStops, action)) {
        look(action);
        await walk(sideStops[action], run);
      } else {
        look(action);
        await wait(330);
      }
    }
    if (run !== generation || idle) return;
    await walk(center, run);
    if (run === generation) {
      look('F');
      show(defaultPose);
    }
  }

  function rest() {
    stop();
    if (defaultPose) show(defaultPose, false);
    if (motion.matches) {
      position = center;
      track.style.transform = '';
    }
  }

  document.addEventListener('visibilitychange', rest);
  motion.addEventListener('change', rest);
  return { setPose, play, rest };
})();
