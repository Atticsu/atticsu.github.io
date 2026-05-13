import { useEffect, useRef, useState } from 'react';

export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (options.once !== false) observer.disconnect();
          } else if (options.once === false) {
            setInView(false);
          }
        });
      },
      {
        threshold: options.threshold ?? 0.18,
        rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.once, options.threshold, options.rootMargin]);

  return [ref, inView];
};

export const useActiveSection = (sectionIds) => {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });
        if (visible.size > 0) {
          const top = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
          setActiveId(top);
        }
      },
      { threshold: [0.2, 0.4, 0.6], rootMargin: '-30% 0px -40% 0px' },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
};
