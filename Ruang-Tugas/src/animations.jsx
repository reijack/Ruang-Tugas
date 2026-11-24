import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 720px), (pointer: coarse)');
const easeOut = 'cubic-bezier(.22,1,.36,1)';

function TouchBook() {
  const bookRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    const book = bookRef.current;
    const page = pageRef.current;
    const popoverSupported = typeof book.showPopover === 'function';
    let touch;
    let timer;
    let bookAnimation;
    let pageAnimation;
    let dialogAtContact;
    let raiseFrame;

    function hide() {
      clearTimeout(timer);
      cancelAnimationFrame(raiseFrame);
      bookAnimation?.cancel();
      pageAnimation?.cancel();
      if (popoverSupported) book.hidePopover();
      book.hidden = true;
      touch = undefined;
    }

    function onContact(event) {
      if (event.pointerType !== 'touch') return;
      hide();
      if (!event.isPrimary) return;

      const { pointerId, clientX, clientY } = event;
      touch = { pointerId, clientX, clientY };
      dialogAtContact = popoverSupported ? document.querySelector('dialog:modal') : null;
      book.style.left = Math.max(0, Math.min(innerWidth - 38, clientX - 14)) + 'px';
      book.style.top = Math.max(0, Math.min(innerHeight - 38, clientY - 40)) + 'px';
      book.hidden = false;
      if (popoverSupported) book.showPopover();

      if (reducedMotion.matches || !book.animate) {
        timer = setTimeout(hide, 220);
        return;
      }

      bookAnimation = book.animate([
        { opacity: .94, transform: 'translateY(2px) rotate(-4deg) scale(.94)', easing: easeOut },
        { opacity: 1, transform: 'translateY(0) rotate(0deg) scale(1)', offset: .3 },
        { opacity: 1, transform: 'translateY(0) rotate(0deg) scale(1)', offset: .7, easing: 'ease-in' },
        { opacity: 0, transform: 'translateY(-5px) rotate(-2deg) scale(.98)' }
      ], { duration: 280, fill: 'both' });
      pageAnimation = page.animate([
        { opacity: .8, transform: 'rotateY(0deg) skewY(-17deg)', easing: 'ease-in' },
        { opacity: 1, transform: 'rotateY(-84deg) skewY(-26deg)', offset: .44, easing: easeOut },
        { opacity: 1, transform: 'rotateY(-176deg) skewY(-17deg)', offset: .86 },
        { opacity: 0, transform: 'rotateY(-179deg) skewY(-17deg)' }
      ], { duration: 220, fill: 'both' });
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
        const openedDialog = document.querySelector('dialog:modal');
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
        .filter(section => section.matches('.page-heading,.welcome-banner,.section-head,.tabs-row,.week-copy-toolbar,.filters'))
        .slice(0, compact ? 2 : 4);
      animations = sections.map((section, index) => section.animate([
        { opacity: .74, transform: `translate(${direction * (compact ? 5 : 10)}px, 3px)` },
        { opacity: 1, transform: 'translate(0, 0)' }
      ], { duration: compact ? 165 : 235, delay: index * (compact ? 14 : 22), easing: easeOut, fill: 'backwards' }));
    }

    document.addEventListener('ruang-tugas:page-entry', enter);
    reducedMotion.addEventListener('change', cancel);
    return () => {
      cancel();
      document.removeEventListener('ruang-tugas:page-entry', enter);
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
