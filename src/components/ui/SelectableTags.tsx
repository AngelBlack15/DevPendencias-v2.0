import React, { useEffect, useRef, useState, useCallback } from 'react';
import './SelectableTags.css';
import './animations.css';
import { useParallaxEffect } from './useParallaxEffect';

// Extender la interfaz CSSProperties para incluir propiedades personalizadas
declare module 'react' {
  interface CSSProperties {
    '--tag-bg'?: string;
    '--tag-bg-dark'?: string;
    '--tag-text'?: string;
    '--tag-scale'?: number | string;
    '--tag-translate-y'?: string;
  }
}

// Interfaz para el estilo de las etiquetas
interface TagStyle {
  '--tag-bg': string;
  '--tag-bg-dark': string;
  '--tag-text': string;
}

// Interfaz para las propiedades del componente
interface SelectableTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  categorized?: boolean;
  categoryMap?: { [key: string]: string[] };
  enableParallax?: boolean;
  parallaxIntensity?: number;
  parallaxRotation?: number;
}

// Interfaz para las propiedades de las etiquetas
interface TagProps {
  label: string;
  selected: boolean;
  onClick: (label: string) => void;
  category?: string;
}

type TagColorKey = keyof typeof TAG_COLORS;

// Mapa de colores para las etiquetas
const TAG_COLORS = {
  // Lenguajes
  javascript: { bg: '#f0db4f', dark: '#d1b400', text: '#323330' },
  typescript: { bg: '#3178c6', dark: '#1e5a9e', text: '#ffffff' },
  python: { bg: '#3776ab', dark: '#2a5a82', text: '#ffd43b' },
  java: { bg: '#007396', dark: '#00506b', text: '#f89820' },
  csharp: { bg: '#9b4f96', dark: '#6d3d6a', text: '#ffffff' },
  php: { bg: '#777bb4', dark: '#595d8a', text: '#ffffff' },
  ruby: { bg: '#cc342d', dark: '#9c2a24', text: '#ffffff' },
  go: { bg: '#00add8', dark: '#0085a3', text: '#ffffff' },
  rust: { bg: '#000000', dark: '#1a1a1a', text: '#ffffff' },
  swift: { bg: '#f05138', dark: '#d1402d', text: '#ffffff' },
  kotlin: { bg: '#7f52ff', dark: '#5e3bb7', text: '#ffffff' },
  
  // Frameworks
  react: { bg: '#61dafb', dark: '#4fa8d1', text: '#20232a' },
  vue: { bg: '#42b883', dark: '#358f6c', text: '#34495e' },
  angular: { bg: '#dd0031', dark: '#a3001e', text: '#ffffff' },
  svelte: { bg: '#ff3e00', dark: '#d13400', text: '#ffffff' },
  nextjs: { bg: '#000000', dark: '#1a1a1a', text: '#ffffff' },
  nuxtjs: { bg: '#00c58e', dark: '#009d74', text: '#ffffff' },
  express: { bg: '#000000', dark: '#1a1a1a', text: '#ffffff' },
  django: { bg: '#092e20', dark: '#041a13', text: '#ffffff' },
  flask: { bg: '#000000', dark: '#1a1a1a', text: '#ffffff' },
  laravel: { bg: '#ff2d20', dark: '#d62c1f', text: '#ffffff' },
  
  // Herramientas
  git: { bg: '#f05032', dark: '#c03426', text: '#ffffff' },
  docker: { bg: '#2496ed', dark: '#1e7bc4', text: '#ffffff' },
  kubernetes: { bg: '#326ce5', dark: '#2653b0', text: '#ffffff' },
  aws: { bg: '#ff9900', dark: '#e88a00', text: '#232f3e' },
  azure: { bg: '#0078d4', dark: '#0062a7', text: '#ffffff' },
  gcp: { bg: '#4285f4', dark: '#2a75f3', text: '#ffffff' },
  firebase: { bg: '#ffca28', dark: '#f4b400', text: '#000000' },
  graphql: { bg: '#e10098', dark: '#b00077', text: '#ffffff' },
  mongodb: { bg: '#47a248', dark: '#3a853b', text: '#ffffff' },
  postgresql: { bg: '#336791', dark: '#2a5476', text: '#ffffff' },
  mysql: { bg: '#4479a1', dark: '#366185', text: '#ffffff' },
  redis: { bg: '#dc382d', dark: '#b32c24', text: '#ffffff' },
  nodejs: { bg: '#68a063', dark: '#4f7d4b', text: '#ffffff' },
  
  // Categorías
  lenguajes: { bg: '#4f46e5', dark: '#4338ca', text: '#ffffff' },
  frameworks: { bg: '#10b981', dark: '#0d9c6b', text: '#ffffff' },
  herramientas: { bg: '#f59e0b', dark: '#d97706', text: '#000000' },
  basesdedatos: { bg: '#ec4899', dark: '#db2777', text: '#ffffff' },
  cloud: { bg: '#3b82f6', dark: '#2563eb', text: '#ffffff' },
  devops: { bg: '#8b5cf6', dark: '#7c3aed', text: '#ffffff' },
  testing: { bg: '#06b6d4', dark: '#0891b2', text: '#ffffff' },
  otros: { bg: '#6b7280', dark: '#4b5563', text: '#ffffff' },
} as const;

// Componente de etiqueta individual
const Tag: React.FC<TagProps> = ({ label, selected, onClick, category }) => {
  const tagRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Determinar el color de la etiqueta
  const getTagStyle = (tag: string): TagStyle => {
    // Primero intentamos hacer match con los colores predefinidos
    const tagKey = tag.toLowerCase().replace(/\s+/g, '') as TagColorKey;
    
    if (TAG_COLORS[tagKey]) {
      return {
        '--tag-bg': TAG_COLORS[tagKey].bg,
        '--tag-bg-dark': TAG_COLORS[tagKey].dark,
        '--tag-text': TAG_COLORS[tagKey].text
      };
    }
    
    // Si no encontramos el color, usamos un color basado en el hash del texto
    const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    
    return {
      '--tag-bg': `hsl(${hue}, 70%, 85%)`,
      '--tag-bg-dark': `hsl(${hue}, 70%, 75%)`,
      '--tag-text': `hsl(${(hue + 180) % 360}, 60%, 30%)`
    };
  };

  const tagStyle = React.useMemo(() => getTagStyle(label), [label]);
  
  const style: React.CSSProperties = {
    '--tag-bg': tagStyle['--tag-bg'],
    '--tag-bg-dark': tagStyle['--tag-bg-dark'],
    '--tag-text': tagStyle['--tag-text'],
    '--tag-scale': isHovered ? 1.05 : 1,
    '--tag-translate-y': isHovered ? '-3px' : '0',
  } as React.CSSProperties;
  
  // Efecto para animar la selección
  useEffect(() => {
    if (selected && tagRef.current) {
      // Añadir clase de animación
      tagRef.current.classList.add('tag-selected-animation');
      
      // Eliminar la clase después de la animación
      const timer = setTimeout(() => {
        if (tagRef.current) {
          tagRef.current.classList.remove('tag-selected-animation');
        }
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [selected]);
  
  // Efecto de sonido al hacer hover
  const playHoverSound = useCallback(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const AudioContext = window.AudioContext || (window as { webkitAudioContext?: new () => AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, []);

  // Efecto de sonido al hacer clic
  const playClickSound = useCallback(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const AudioContext = window.AudioContext || (window as { webkitAudioContext?: new () => AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, []);

  const handleClick = useCallback(() => {
    playClickSound();
    onClick(label);
  }, [label, onClick, playClickSound]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playHoverSound();
  }, [playHoverSound]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <button
      ref={tagRef}
      className={`tag ${selected ? 'selected' : ''} ${category ? `category-${category.toLowerCase()}` : ''} ${isHovered ? 'hover' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-pressed={selected}
      aria-label={`${label} ${selected ? 'seleccionado' : 'no seleccionado'}`}
      style={style}
    >
      {label}
    </button>
  );
};

const SelectableTags: React.FC<SelectableTagsProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  categorized = false,
  categoryMap = {},
  enableParallax = true,
  parallaxIntensity = 0.5,
  parallaxRotation = 1,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Aplicar efecto de parallax al contenedor principal
  const parallaxRef = useParallaxEffect({
    intensity: parallaxIntensity,
    rotation: parallaxRotation,
    enabled: enableParallax
  });
  
  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedCategory(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Si no está categorizado, mostrar todas las etiquetas
  if (!categorized) {
    return (
      <div className="selectable-tags-container">
        {tags.map(tag => (
          <Tag
            key={tag}
            label={tag}
            selected={selectedTags.includes(tag)}
            onClick={onTagToggle}
          />
        ))}
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  // Función para obtener el estilo de la categoría
  const getCategoryStyle = (category: string): React.CSSProperties | undefined => {
    const categoryKey = category.toLowerCase().replace(/\s+/g, '') as TagColorKey;
    
    if (TAG_COLORS[categoryKey]) {
      return {
        '--category-bg': TAG_COLORS[categoryKey].bg,
        '--category-bg-dark': TAG_COLORS[categoryKey].dark,
        '--category-text': TAG_COLORS[categoryKey].text,
      } as React.CSSProperties;
    }
    
    return undefined;
  };

  // Fusionar las referencias para el contenedor
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    // Actualizar la referencia del contenedor
    if (containerRef) {
      containerRef.current = node;
    }
    
    // Actualizar la referencia del efecto parallax
    if (node) {
      if (typeof parallaxRef === 'function') {
        parallaxRef(node);
      } else if (parallaxRef && 'current' in parallaxRef) {
        // Usar type assertion para evitar el error de TypeScript
        const ref = parallaxRef as React.MutableRefObject<HTMLDivElement | null>;
        ref.current = node;
      }
    }
  }, [containerRef, parallaxRef]);

  return (
    <div className="selectable-tags-wrapper" ref={setRefs}>
      {/* Fondo de partículas (opcional) */}
      <div className="tags-background"></div>
      
      <div className="categories-container">
        {Object.entries(categoryMap).map(([category, categoryTags]) => {
          const categoryStyle = getCategoryStyle(category);
          const isExpanded = expandedCategory === category;
          
          return (
            <div key={category} className="category-group">
              <button 
                className={`category-header ${isExpanded ? 'expanded' : ''} hover-lift`}
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                style={categoryStyle}
              >
                <span className="category-name">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                <span className="category-arrow">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              
              {isExpanded && (
                <div 
                  className="category-tags expanded glass-effect depth-effect"
                  aria-hidden={false}
                >
                  <div className="category-tags-inner">
                    {categoryTags
                      .filter(tag => tags.includes(tag))
                      .map(tag => (
                        <Tag
                          key={tag}
                          label={tag}
                          selected={selectedTags.includes(tag)}
                          onClick={onTagToggle}
                          category={category}
                        />
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectableTags;
