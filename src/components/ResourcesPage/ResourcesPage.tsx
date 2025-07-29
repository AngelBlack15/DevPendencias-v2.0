//rc/components/ResourcesPage/ResourcesPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedButton from '../ui/AnimatedButton';
import SelectableTags from '../ui/SelectableTags';
import ClearFiltersButton from '../ui/ClearFiltersButton';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import './ResourcesPage.css';

const API_BASE = 'http://localhost:3000/api';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  visits: number;
  likes: number;
  isLiked: boolean;
  image: string;
  tags: string[];
}

// Importar imágenes (asegúrate de tener estas imágenes en tu proyecto)
const logo = '/devpendenciasIMG/logobros.svg';
const icon1 = '/devpendenciasIMG/program.svg';
const icon2 = '/devpendenciasIMG/monitor.svg';

// Categorías y etiquetas
const tagCategories = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'SQL', 'Bash'],
  frontend: ['React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Remix', 'Astro', 'SvelteKit', 'Gatsby', 'Redux', 'MobX', 'Zustand', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Headless UI', 'Radix UI', 'ShadCN', 'Framer Motion'],
  backend: ['Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'Laravel', 'Spring Boot', 'ASP.NET', 'GraphQL', 'REST API', 'gRPC', 'WebSockets'],
  databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'DynamoDB', 'Firebase', 'Supabase', 'Prisma', 'Sequelize', 'Mongoose', 'TypeORM'],
  tools: ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Vercel', 'Netlify', 'Heroku', 'Railway', 'Cloudflare', 'Vite', 'Webpack', 'Parcel', 'Babel', 'ESLint', 'Prettier', 'Husky', 'PM2'],
  testing: ['Jest', 'Mocha', 'Jasmine', 'Cypress', 'Playwright', 'Selenium', 'Vitest', 'Testing Library'],
  design: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Zeplin', 'Storybook']
};

// Todas las etiquetas en un solo array
const allTags = Object.values(tagCategories).flat();

const ResourcesPage: React.FC = () => {
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Filtrar posts basado en las etiquetas seleccionadas
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPosts(postsData);
    } else {
      setFilteredPosts(
        postsData.filter(post => 
          selectedTags.some(selectedTag => 
            post.tags.some(postTag => 
              postTag.toLowerCase().includes(selectedTag.toLowerCase())
            )
          )
        )
      );
    }
  }, [selectedTags, postsData]);
  
  // Manejar selección/deselección de etiquetas
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handlePublishClick = () => {
  // 1) Si no está autenticado, mostrar alerta de acceso restringido
  if (!isAuthenticated) {
    Swal.fire({
      title: 'Acceso restringido',
      text: 'Lo sentimos, primero debe identificarse. Por favor use el botón "Iniciar sesión"',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#232122',
    });
    return;
  }

  // 2) Si está autenticado pero no es admin, mostrar alerta de acceso denegado
  if (user?.role !== 'admin') {
    Swal.fire({
      title: 'Acceso denegado',
      text: 'Lo sentimos, usted no cuenta con el rol de administrador. No tiene permitido crear publicaciones.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#232122',
    });
    return;
  }

  // 3) Si es admin, redirigir al panel de administración
  navigate('/admin');
};


  const handleLoginClick = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
  };

  const handleRegisterClick = () => {
    setShowRegisterForm(true);
    setShowLoginForm(false);
  };

  const handleCloseRegisterForm = () => {
    setShowRegisterForm(false);
  };

  const handleLogout = async () => {
    logout();
    // Mostrar mensaje de cierre de sesión exitoso
    await Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente',
      confirmButtonColor: '#232122',
    });
    
    // Recargar la página para asegurar que se actualice el estado de autenticación
    window.location.reload();
  };

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  // Estados para el manejo del scroll (ya no se usan)

// Al montar, traemos los links desde tu API
useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/links`);
      if (!response.ok) throw new Error(`Error al cargar links (${response.status})`);
      
      const links = await response.json() as Array<{
        _id: string;
        title: string;
        description?: string;
        createdAt?: string;
        visits?: number;
        likes?: number;
        image?: string;
        tags?: string | string[];
      }>;
      
      const mapped: Post[] = links.map((link) => ({
        id: link._id,
        title: link.title,
        excerpt: (link.description || '').slice(0, 100) + '...',
        date: new Date(link.createdAt || Date.now()).toLocaleDateString(),
        visits: typeof link.visits === 'number' ? link.visits : 0,
        likes: typeof link.likes === 'number' ? link.likes : 0,
        isLiked: false,
        image: link.image || '/devpendenciasIMG/placeholder.png',
        tags: Array.isArray(link.tags) ? link.tags : [link.tags || 'Sin categoría']
      }));
      
      setPostsData(mapped);
    } catch (err) {
      console.error('Error cargando posts:', err);
      // Mostrar alerta al usuario
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las publicaciones. Por favor, intente de nuevo más tarde.',
        icon: 'error',
        confirmButtonColor: '#232122',
      });
    }
  };
  
  fetchPosts();
}, []);




  // Función para ver detalles de un post
  const viewPostDetails = async (postId: string) => {
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    
    try {
      // Actualizar contador de visitas en el backend
      const response = await fetch(`${API_BASE}/links/${postId}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el contador de visitas');
      }

      // Actualizar contador de visitas localmente
      setPostsData(current =>
        current.map(p => 
          p.id === postId 
            ? { ...p, visits: p.visits + 1 }
            : p
        )
      );
      
      // Navegar a la ruta de detalles del post
      navigate(`/recursos/${postId}`, { state: { post } });
      
    } catch (error) {
      console.error('Error al actualizar el contador de visitas:', error);
      // Aún así navegar a la página de detalles aunque falle la actualización del contador
      navigate(`/recursos/${postId}`, { state: { post } });
    }
  };

  const handleCloseLoginForm = () => {
    setShowLoginForm(false);
  };
  
const toggleLike = async (postId: string) => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    Swal.fire({
      title: 'Inicia sesión para calificar',
      text: 'Debes iniciar sesión para poder calificar artículos. ¿Deseas iniciar sesión ahora?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#232122',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, iniciar sesión',
      cancelButtonText: 'Quizás después'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowLoginForm(true);
      }
    });
    return;
  }

  const post = postsData.find(p => p.id === postId);
  if (!post) return;
  const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;

  try {
    const res = await fetch(`${API_BASE}/links/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: newLikes })
    });
    
    if (!res.ok) {
      throw new Error('Error al actualizar los likes');
    }
    
    setPostsData(current =>
      current.map(p =>
        p.id === postId
          ? { ...p, likes: newLikes, isLiked: !p.isLiked }
          : p
      )
    );
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo actualizar la calificación. Por favor, inténtalo de nuevo.',
      icon: 'error',
      confirmButtonColor: '#232122'
    });
  }
};

  return (
    <div className="resources-container">
      {/* Header */}
      <header className="resources-header">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="logo" onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/vite.svg';
            }} />
          </Link>
          {isAuthenticated && user?.name && (
            <span className="welcome-message">
              ¡Hola, {user.name}!
            </span>
          )}
        </div>
        <div className="header-buttons">
          <AnimatedButton 
            text="Publicar" 
            onClick={handlePublishClick}
            color="#232122"
            hoverTextColor="#ffffff"
            className="publish-button"
          />
          {isAuthenticated ? (
            <AnimatedButton 
              text="Cerrar sesión" 
              onClick={handleLogout}
              color="#232122"
              hoverTextColor="#ff4d4f"
              className="publish-button"
            />
          ) : (
            <>
              <AnimatedButton 
                text="Iniciar sesión" 
                onClick={handleLoginClick}
                color="#232122"
                hoverTextColor="#ffffff"
                className="publish-button"
                style={{ marginRight: '10px' }}
              />
              <AnimatedButton 
                text="Registrarse" 
                onClick={handleRegisterClick}
                color="#232122"
                hoverTextColor="#00bcd4"
                className="publish-button"
              />
            </>
          )}
        </div>
      </header>

      {/* Formulario de inicio de sesión */}
      {showLoginForm && (
        <LoginForm 
          onClose={handleCloseLoginForm} 
          onSwitchToRegister={handleRegisterClick} 
        />
      )}
      
      {/* Formulario de registro */}
      {showRegisterForm && (
        <RegisterForm 
          onClose={handleCloseRegisterForm}
          onSwitchToLogin={handleLoginClick}
        />
      )}

      <main className="resources-main">
        {/* Título con iconos */}
        <div className="resources-title-container">
          <img src={icon1} alt="" className="title-icon" />
          <h1 className="resources-title">
            <span className="dev-text">DEV</span>pendencias
          </h1>
          <img src={icon2} alt="" className="title-icon" />
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar..."
          />
        </div>

        {/* Sección de etiquetas */}
        <div className="tags-section">
          <h3 className="section-title">Filtrar por tecnologías</h3>
          <SelectableTags
            tags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            categorized={true}
            categoryMap={tagCategories}
          />
          {selectedTags.length > 0 && (
            <div className="selected-tags-info">
              <span>Filtrando por: </span>
              <div className="selected-tags">
                {selectedTags.map(tag => (
                  <div key={tag} className="selected-tag">
                    <span className="tag-text">{tag}</span>
                    <button 
                      className="tag-close" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagToggle(tag);
                      }}
                      aria-label={`Quitar filtro ${tag}`}
                      title="Eliminar"
                    >
                      <svg 
                        width="10" 
                        height="10" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M12 4L4 12M4 4L12 12" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
                <ClearFiltersButton onClick={() => setSelectedTags([])} />
              </div>
            </div>
          )}
        </div>

          {/* Grid de posts */}
          <div className="posts-grid">
          {filteredPosts.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron publicaciones con los filtros seleccionados.</p>
                <ClearFiltersButton onClick={() => setSelectedTags([])} />
              </div>
            ) : (
              filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              {/* Imagen de vista previa */}
              <div className="post-image-container">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="post-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible';
                  }}
                />
              </div>
              
              <div className="post-content">
                <div className="post-header">
                  <h3 className="post-title">{post.title}</h3>
                  <div className="like-button-wrapper">
                    <input 
                      id={`heart-${post.id}`} 
                      type="checkbox" 
                      checked={post.isLiked}
                      onChange={() => toggleLike(post.id)}
                    />
                    <label className="like" htmlFor={`heart-${post.id}`}>
                      <svg
                        className="like-icon"
                        fillRule="nonzero"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
                        ></path>
                      </svg>
                      <span className="like-text">Likes</span>
                    </label>
                    <span className="like-count one">{post.likes - (post.isLiked ? 1 : 0)}</span>
                    <span className="like-count two">{post.likes}</span>
                  </div>
                </div>
                
                <div className="post-meta">
                  <span className="post-date">{post.date}</span>
                  <span className="post-visits">• {post.visits.toLocaleString()} visitas</span>
                </div>
                
                <p className="post-excerpt">{post.excerpt}</p>
                
                <div className="post-tags">
                  {post.tags.slice(0, 6).map((tag, i) => (
                    <span key={i} className="post-tag">{tag}</span>
                  ))}
                  {post.tags.length > 6 && (
                    <span className="post-tag more-tags">+{post.tags.length - 6} más</span>
                  )}
                </div>
                
                 <button 
                   className="details-button"
                   onClick={() => viewPostDetails(post.id)}
                 >
                   Ver detalles
                 </button>
              </div>
            </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;
