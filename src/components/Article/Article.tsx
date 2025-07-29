// src/components/Article/Article.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Article.css';

// Importar iconos
import { FiExternalLink, FiEye, FiCalendar, FiArrowLeft, FiHeart } from 'react-icons/fi';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  date: string;
  visits: number;
  likes: number;
  isLiked: boolean;
  image: string;
  tags: string[];
  url: string;
}

interface ArticleProps {
  // Props opcionales para cuando se usa directamente
  title?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  url?: string;
}

const API_BASE = 'http://localhost:3000/api';

const Article: React.FC<ArticleProps> = (props) => {
  console.log('=== Article Component Mounted ===');
  console.log('Props recibidas:', props);
  
  const navigate = useNavigate();
  const { state } = useLocation();
  const params = useParams<{ id: string }>();
  
  console.log('Router State:', state);
  console.log('URL Params:', params);
  
  const [post, setPost] = useState<Post | null>(() => {
    // Estado inicial basado en props o state del router
    const initialPost = state?.post || 
      (props.title ? {
        id: 'direct',
        title: props.title || '',
        excerpt: props.description ? props.description.slice(0, 100) + (props.description.length > 100 ? '...' : '') : '',
        description: props.description || '',
        date: new Date().toISOString(),
        visits: 0,
        likes: 0,
        isLiked: false,
        image: props.imageUrl || '/devpendenciasIMG/placeholder.png',
        tags: props.tags || [],
        url: props.url || ''
      } : null);
    
    console.log('Estado inicial del post:', initialPost);
    return initialPost;
  });

  // Función para formatear la fecha con manejo de errores robusto
  const formatDate = (dateInput: string | Date | undefined | null): string => {
    // Si no hay entrada, retornar mensaje por defecto
    if (!dateInput) {
      console.log('No se proporcionó fecha, usando valor por defecto');
      return 'Fecha no disponible';
    }
    
    try {
      // Si ya es un objeto Date, usarlo directamente
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida recibida, creando nueva fecha:', dateInput);
        // Si la fecha no es válida, usar la fecha actual
        return format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
      }
      
      // Formatear la fecha
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Valor recibido:', dateInput);
      // En caso de error, retornar la fecha actual formateada
      return format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
    }
  };

  // Función para validar y formatear la URL
  const formatUrl = (url: string): string => {
    console.log('URL original:', url);
    if (!url) {
      console.log('URL vacía');
      return '';
    }
    // Asegurarse de que la URL comience con http:// o https://
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    console.log('URL formateada:', formattedUrl);
    return formattedUrl;
  };
  
  // Función para registrar una visita al artículo
  const registerVisit = async (articleId: string) => {
    try {
      console.log(`Registrando visita para el artículo ${articleId}`);
      const response = await fetch(`${API_BASE}/links/${articleId}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al registrar la visita');
      }
      
      const updatedPost = await response.json();
      console.log('Visita registrada:', updatedPost);
      return updatedPost;
    } catch (error) {
      console.error('Error al registrar visita:', error);
      return null;
    }
  };

  // Si no venía en state ni en props, lo buscamos por ID
  useEffect(() => {
    console.log('useEffect - Iniciando carga de datos');
    console.log('Post actual:', post);
    console.log('ID del parámetro:', params.id);
    
    if (!post && params.id) {
      console.log('No hay post en el estado, realizando fetch...');
      
      console.log(`Realizando petición a: ${API_BASE}/links/${params.id}`);
      
      // Primero obtenemos el post
      fetch(`${API_BASE}/links/${params.id}`)
        .then(res => {
          console.log('Respuesta recibida, status:', res.status);
          if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then((l: {
          _id: string;
          title: string;
          description: string;
          createdAt?: string;
          visits?: number;
          likes?: number;
          image?: string;
          tags?: string | string[];
          url: string;
        }) => {
          console.log('Datos recibidos del servidor:', l);
          console.log('Datos del post desde la API:', l);
          const formattedPost: Post = {
            id: l._id,
            title: l.title,
            excerpt: (l.description || '').slice(0, 100) + (l.description && l.description.length > 100 ? '...' : ''),
            description: l.description || 'Sin descripción disponible',
            // Asegurarse de que siempre haya una fecha válida
            date: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
            visits: typeof l.visits === 'number' ? l.visits : 0,
            likes: typeof l.likes === 'number' ? l.likes : 0,
            isLiked: false,
            image: l.image || '/devpendenciasIMG/placeholder.png',
            tags: Array.isArray(l.tags) ? l.tags : [l.tags || 'Sin categoría'],
            url: formatUrl(l.url) // Aplicar formato a la URL
          };
          console.log('Post formateado:', formattedPost);
          setPost(formattedPost);
          
          // Registrar la visita después de cargar el post
          registerVisit(params.id as string);
        })
        .catch(error => {
          console.error('Error cargando el post:', error);
          // Mostrar mensaje de error al usuario
          console.error('Stack trace:', error.stack);
        });
    }
  }, [params.id, post]);

  // Depuración: mostrar el objeto post en consola
  console.log('=== Renderizando componente Article ===');
  console.log('Post actual:', post);
  console.log('URL de la imagen:', post?.image);
  
  if (!post) {
    console.log('No hay datos del post, mostrando estado de carga...');
    return <div className="article-container"><p>Cargando artículo…</p></div>;
  }

  const handleBackToResources = () => {
    navigate('/recursos');
  };

  const handleBackToBoard = () => {
    navigate('/recursos');
  };

  return (
    <div className="article-container">
      <header className="article-header">
        <div className="logo-container" onClick={handleBackToResources}>
          <img 
            src="/devpendenciasIMG/logobros.svg" 
            alt="BrosValley Logo" 
            className="article-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/logo-brosvalley.png';
            }}
          />
        </div>
        <button className="back-button" onClick={handleBackToBoard}>
          <FiArrowLeft size={18} />
          <span>Volver al tablón</span>
        </button>
      </header>

      <main className="article-content">
        <h1 className="article-title">{post.title}</h1>
        
        <div className="article-tags">
          {post.tags.map((tag, i) => (
            <span key={i} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="article-meta">
          <span>
            <FiCalendar size={16} />
            {post.date ? formatDate(post.date) : 'Fecha no disponible'}
          </span>
          <span>
            <FiEye size={16} />
            {post.visits || 0} visitas
          </span>
          <span>
            <FiHeart size={16} fill={post.isLiked ? '#ff4d4f' : 'none'} color={post.isLiked ? '#ff4d4f' : 'currentColor'} />
            {post.likes || 0} me gusta
          </span>
        </div>
        
        <div className="article-description">
          <h3>Descripción</h3>
          <p>{post.description || post.excerpt || 'Esta publicación no tiene una descripción disponible.'}</p>
        </div>

        {post.image && post.image !== '/devpendenciasIMG/placeholder.png' && (
          <div className="article-image-container">
            <img 
              src={post.image} 
              alt={post.title} 
              className="article-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/devpendenciasIMG/placeholder.png';
              }}
            />
          </div>
        )}

        <div className="article-actions">
          <button 
            onClick={() => window.open(post.url, '_blank', 'noopener,noreferrer')}
            className="visit-button"
            disabled={!post.url}
          >
            <FiExternalLink size={18} />
            <span>Visitar herramienta</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Article;
