import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

interface UseIntersectionObserverReturn<T extends HTMLElement> {
  ref: React.RefObject<T>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

const useIntersectionObserver = <T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setEntry(entry);

      if (entry.isIntersecting) {
        if (delay > 0) {
          setTimeout(() => {
            setIsIntersecting(true);
          }, delay);
        } else {
          setIsIntersecting(true);
        }

        if (triggerOnce && observerRef.current && ref.current) {
          observerRef.current.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        setIsIntersecting(false);
      }
    },
    [delay, triggerOnce]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  return { ref, isIntersecting, entry };
};

export default useIntersectionObserver;
