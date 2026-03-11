import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Don't scroll to top on initial load (let browser or page handle restoration)
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    // Scroll to the top of the page instantly when the route changes
    // Using 'instant' instead of 'smooth' to avoid visible scroll animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
