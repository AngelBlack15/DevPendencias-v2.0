import { useEffect, useRef } from 'react';

interface ParallaxOptions {
  intensity?: number;
  rotation?: number;
  enabled?: boolean;
}

export const useParallaxEffect = (options: ParallaxOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    intensity = 0.5,
    rotation = 1,
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    container.classList.add('parallax-enabled');

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      // Aplicar transformación al contenedor principal
      container.style.setProperty('--parallax-x', `${x * 15}px`);
      container.style.setProperty('--parallax-y', `${y * 15}px`);
      
      // Aplicar efecto de rotación 3D a los grupos de categorías
      const categoryGroups = container.querySelectorAll<HTMLElement>('.category-group');
      categoryGroups.forEach(group => {
        const rect = group.getBoundingClientRect();
        const groupX = (e.clientX - rect.left) / rect.width - 0.5;
        const groupY = (e.clientY - rect.top) / rect.height - 0.5;
        
        group.style.setProperty('--parallax-rotation-x', `${-groupY * rotation}deg`);
        group.style.setProperty('--parallax-rotation-y', `${groupX * rotation}deg`);
        group.style.transform = `translateZ(5px) rotateX(calc(var(--parallax-rotation-x, 0) * ${intensity})) rotateY(calc(var(--parallax-rotation-y, 0) * ${intensity}))`;
      });
      
      // Aplicar efecto más sutil a las etiquetas individuales
      const tags = container.querySelectorAll<HTMLElement>('.tag');
      tags.forEach(tag => {
        const rect = tag.getBoundingClientRect();
        const tagX = (e.clientX - rect.left) / rect.width - 0.5;
        const tagY = (e.clientY - rect.top) / rect.height - 0.5;
        
        tag.style.transform = `translate3d(${tagX * 5}px, ${tagY * 5}px, 0)`;
      });
    };

    const handleMouseLeave = () => {
      if (!container) return;
      
      // Restablecer transformaciones al salir
      container.style.removeProperty('--parallax-x');
      container.style.removeProperty('--parallax-y');
      
      const categoryGroups = container.querySelectorAll<HTMLElement>('.category-group');
      categoryGroups.forEach(group => {
        group.style.removeProperty('--parallax-rotation-x');
        group.style.removeProperty('--parallax-rotation-y');
        group.style.transform = 'translateZ(0)';
      });
      
      const tags = container.querySelectorAll<HTMLElement>('.tag');
      tags.forEach(tag => {
        tag.style.transform = 'translate3d(0, 0, 0)';
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.classList.remove('parallax-enabled');
    };
  }, [enabled, intensity, rotation]);

  return containerRef;
};
