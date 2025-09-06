import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, className = '', zIndex = 10000 }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    // Create portal container
    const portalContainer = document.createElement('div');
    portalContainer.className = className;
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.width = '100%';
    portalContainer.style.height = '100%';
    portalContainer.style.pointerEvents = 'none';
    portalContainer.style.zIndex = zIndex.toString();
    
    document.body.appendChild(portalContainer);
    elementRef.current = portalContainer;

    return () => {
      if (elementRef.current) {
        document.body.removeChild(elementRef.current);
      }
    };
  }, [className, zIndex]);

  return elementRef.current ? createPortal(children, elementRef.current) : null;
};

export default Portal;
