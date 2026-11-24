import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 720px), (pointer: coarse)');
const easeOut = 'cubic-bezier(.22,1,.36,1)';

function TouchBook() {
  const bookRef = useRef(null);
  const pageRef = useRef(null);
  const rippleRef = useRef(null);

  useEffect(() => {
    const book = bookRef.current;
    const page = pageRef.current;
    const ripple = rippleRef.current;
    const popoverSupported = typeof book.showPopover === 'function';
    let touch;
    let timer;
    let bookAnimation;
    let pageAnimation;
    let rippleAnimation;
    let dialogAtContact;
    let raiseFrame;

    function stopMotion() {
      clearTimeout(timer);
      cancelAnimationFrame(raiseFrame);
      bookAnimation?.cancel();
      pageAnimation?.cancel();
      rippleAnimation?.cancel();
    }

    function hide() {
      stopMotion();
      if (popoverSupported && !book.hidden) book.hidePopover();
      book.hidden = true;
      touch = undefined;
    }

    function onContact(event) {
      if (event.pointerType !== 'touch') return;
      if (!event.isPrimary) {
        hide();
        return;
      }
      stopMotion();

      const { pointerId, clientX, clientY } = event;
      touch = { pointerId, clientX, clientY };
      dialogAtContact = event.target.closest('dialog[open]');
      const left = Math.max(0, Math.min(innerWidth - 38, clientX - 14));
      const top = Math.max(0, Math.min(innerHeight - 38, clientY - 40));
      book.style.left = left + 'px';
      book.style.top = top + 'px';
      book.hidden = false;
      if (popoverSupported && !book.matches(':popover-open')) book.showPopover();

      if (reducedMotion.matches || !book.animate) {
        timer = setTimeout(hide, 220);
        return;
      }

      ripple.style.left = clientX - left + 'px';
      ripple.style.top = clientY - top + 'px';
      rippleAnimation = ripple.animate([
        { opacity: .65, transform: 'translate(-50%, -50%) scale(.55)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(2.15)' }
      ], { duration: 280, easing: easeOut });

      bookAnimation = book.animate([
        { opacity: .96, transform: 'translateY(2px) rotate(-6deg) scale(.92)', easing: easeOut },
        { opacity: 1, transform: 'translateY(-1px) rotate(1deg) scale(1.035)', offset: .28, easing: easeOut },
        { opacity: 1, transform: 'translateY(0) rotate(0deg) scale(1)', offset: .57, easing: 'ease-in' },
        { opacity: 0, transform: 'translateY(-5px) rotate(-2deg) scale(.99)' }
      ], { duration: 345, fill: 'both' });
      pageAnimation = page.animate([
        { opacity: .8, transform: 'rotateY(0deg) skewY(-17deg)', easing: 'ease-in' },
        { opacity: 1, transform: 'rotateY(-84deg) skewY(-26deg)', offset: .44, easing: easeOut },
        { opacity: 1, transform: 'rotateY(-176deg) skewY(-17deg)', offset: .86 },
        { opacity: 0, transform: 'rotateY(-179deg) skewY(-17deg)' }
      ], { duration: 265, fill: 'both' });
      bookAnimation.onfinish = hide;
    }

    function onMove(event) {
      if (event.pointerId !== touch?.pointerId) return;
      if (Math.hypot(event.clientX - touch.clientX, event.clientY - touch.clientY) > 8) hide();
    }

    function onCancel(event) {
      if (event.pointerId === touch?.pointerId) hide();
    }

    function onRelease(event) {
      if (event.pointerId === touch?.pointerId) touch = undefined;
    }

    function onClick() {
      if (book.hidden || !popoverSupported) return;
      raiseFrame = requestAnimationFrame(() => {
        // A dialog opened by this tap can cover the book in the top layer.
        const openedDialog = document.activeElement?.closest('dialog[open]');
        if (!book.hidden && openedDialog && openedDialog !== dialogAtContact) {
          book.hidePopover();
          book.showPopover();
        }
      });
    }

    const listeners = {
      pointerdown: onContact,
      pointermove: onMove,
      pointercancel: onCancel,
      pointerup: onRelease,
      click: onClick
    };
    for (const [type, listener] of Object.entries(listeners)) {
      document.addEventListener(type, listener, { capture: true, passive: true });
    }
    reducedMotion.addEventListener('change', hide);
    return () => {
      hide();
      reducedMotion.removeEventListener('change', hide);
      for (const [type, listener] of Object.entries(listeners)) {
        document.removeEventListener(type, listener, true);
      }
    };
  }, []);

  return (
    <span ref={bookRef} className="touch-book" popover="manual" aria-hidden="true" hidden>
      <span ref={rippleRef} className="touch-book-ripple" />
      <span ref={pageRef} className="touch-book-page" />
    </span>
  );
}

function PageMotion() {
  useEffect(() => {
    let animations = [];

    function cancel() {
      for (const animation of animations) animation.cancel();
      animations = [];
    }

    function enter(event) {
      cancel();
      const main = event.target;
      if (reducedMotion.matches || !main.animate) return;

      const compact = compactScreen.matches;
      const direction = event.detail.direction;
      const sections = Array.from(main.children)
        .filter(section => section.matches('.page-heading,.welcome-banner,.section-head,.tabs-row,.week-copy-toolbar,.filters')
          || (compact && section.matches('.stats-grid')))
        .slice(0, compact ? 3 : 4);
      animations = sections.map((section, index) => section.animate([
        { opacity: .74, transform: `translate(${direction * (compact ? 8 : 10)}px, ${compact ? 5 : 3}px)` },
        { opacity: 1, transform: 'translate(0, 0)' }
      ], { duration: compact ? 215 : 235, delay: index * (compact ? 26 : 22), easing: easeOut, fill: 'backwards' }));
    }

    function enterTaskList(event) {
      if (!compactScreen.matches || reducedMotion.matches) return;
      const list = event.target;
      if (!list.animate) return;

      cancel();
      animations = Array.from(list.children).slice(0, 3).map((card, index) => card.animate([
        { opacity: .68, transform: 'translateY(9px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 200, delay: index * 24, easing: easeOut, fill: 'backwards' }));
    }

    document.addEventListener('ruang-tugas:page-entry', enter);
    document.addEventListener('ruang-tugas:task-list-entry', enterTaskList);
    reducedMotion.addEventListener('change', cancel);
    return () => {
      cancel();
      document.removeEventListener('ruang-tugas:page-entry', enter);
      document.removeEventListener('ruang-tugas:task-list-entry', enterTaskList);
      reducedMotion.removeEventListener('change', cancel);
    };
  }, []);
  return null;
}

createRoot(document.getElementById('animation-root')).render(
  <>
    <TouchBook />
    <PageMotion />
  </>
);
