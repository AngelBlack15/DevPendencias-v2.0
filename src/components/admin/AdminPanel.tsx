//rc/components/admin/AdminPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const API_BASE = 'http://localhost:3000/api';

interface Post {
  id: string;    
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
}

interface PostFormData {
  title: string;
  description: string;
  url: string;
  image: File | string | null;
  tags: string[];
}

// reemplaza por esto:
const TAGS_OPTIONS = [
  // languages
  'JavaScript','TypeScript','Python','Java','C#','C++','C','PHP','Ruby','Go','Rust','Swift','Kotlin','Dart','Scala','R','SQL','Bash',
  // frontend
  'React','Angular','Vue.js','Svelte','Next.js','Nuxt.js','Remix','Astro','SvelteKit','Gatsby','Redux','MobX','Zustand',
  'Tailwind CSS','Bootstrap','Material UI','Chakra UI','Headless UI','Radix UI','ShadCN','Framer Motion',
  // backend
  'Node.js','Express.js','NestJS','Django','Flask','FastAPI','Ruby on Rails','Laravel','Spring Boot','ASP.NET',
  'GraphQL','REST API','gRPC','WebSockets',
  // databases
  'MongoDB','PostgreSQL','MySQL','SQLite','Redis','DynamoDB','Firebase','Supabase','Prisma','Sequelize','Mongoose','TypeORM',
  // tools
  'Git','GitHub','GitLab','Bitbucket','Docker','Kubernetes','AWS','Azure','Google Cloud','Vercel','Netlify','Heroku',
  'Railway','Cloudflare','Vite','Webpack','Parcel','Babel','ESLint','Prettier','Husky','PM2',
  // testing
  'Jest','Mocha','Jasmine','Cypress','Playwright','Selenium','Vitest','Testing Library',
  // design
  'Figma','Adobe XD','Sketch','InVision','Zeplin','Storybook'
];


const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) setUserEmail(email);
  }, []);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    url: '',
    image: null,
    tags: []
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Posts traídos de MongoDB vía API
const [posts, setPosts] = useState<Post[]>([]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    Swal.fire({
   title: '¿Seguro que deseas eliminar este post?',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonText: 'Sí, eliminar',
   cancelButtonText: 'Cancelar'
 }).then(result => {
   if (result.isConfirmed) {
     fetch(`${API_BASE}/links/${id}`, { method: 'DELETE' })
       .then(res => {
         if (res.status === 204) {
           setPosts(posts.filter(p => p.id !== id));
           Swal.fire('Eliminado', 'El post ha sido eliminado.', 'success');
         } else {
           Swal.fire('Error', 'No se pudo eliminar.', 'error');
         }
       });
   }
 });
};

  const handleEdit = (id: string) => {
    const postToEdit = posts.find(post => post.id === id);
    if (postToEdit) {
      handleEditPost(postToEdit);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      image: null,
      tags: []
    });
    setImagePreview(null);
    setShowPostForm(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      url: post.url,
      image: null,
      tags: [...post.tags]
    });
    setImagePreview(post.image);
    setShowPostForm(true);
  };

  const handleCloseForm = () => {
    setShowPostForm(false);
    setEditingPost(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      image: null,
      tags: []
    });
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño de la imagen (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Imagen demasiado grande',
          text: 'La imagen no debe pesar más de 5MB',
          icon: 'warning',
          confirmButtonColor: '#232122'
        });
        return;
      }
      
      // Validar tipo de archivo
      if (!file.type.match('image/(jpeg|jpg|png|gif|webp)')) {
        Swal.fire({
          title: 'Formato no soportado',
          text: 'Por favor sube una imagen en formato JPG, PNG, GIF o WebP',
          icon: 'warning',
          confirmButtonColor: '#232122'
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) Validar URL si está presente
    if (formData.url && !/^https?:\/\//i.test(formData.url)) {
      await Swal.fire({
        title: 'URL inválida',
        text: 'Por favor ingresa una URL válida que comience con http:// o https://',
        icon: 'warning',
        confirmButtonColor: '#232122'
      });
      return;
    }

    try {
      let imageUrl = editingPost?.image || '';
      
      // 2) Si hay una nueva imagen, subirla primero
      if (formData.image) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('image', formData.image);
        
        const uploadResponse = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formDataToUpload,
          // No establecer Content-Type manualmente, el navegador lo hará con el límite correcto
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json().catch(() => ({}));
          throw new Error(error.message || 'Error al subir la imagen');
        }
        
        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      // 3) Crear o actualizar el post con la URL de la imagen
      let response;
      const postData = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        image: imageUrl,
        tags: formData.tags
      };
      
      if (editingPost) {
        // 3A) EDITAR post existente
        response = await fetch(`${API_BASE}/links/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      } else {
        // 3B) CREAR nuevo post
        response = await fetch(`${API_BASE}/links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      }

      // Procesar la respuesta
      let result;
      try {
        result = await response.json();
      } catch (error) {
        console.error('Error parsing response:', {
          error,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error('Error al procesar la respuesta del servidor');
      }

      // Si hay un error en la respuesta, lanzarlo
      if (!response.ok) {
        const errorMessage = result.error || result.message || 'Error en la operación';
        throw new Error(errorMessage);
      }

      // Si llegamos aquí, la operación fue exitosa
      if (editingPost) {
        // Actualizar el post existente en el estado
        setPosts(posts.map(p =>
          p.id === editingPost.id ? {
            ...p,
            title: result.title || p.title,
            description: result.description || p.description,
            url: result.url || p.url,
            image: result.image || p.image,
            tags: result.tags || p.tags || []
          } : p
        ));
      } else {
        // Agregar el nuevo post al estado
        const newPost = {
          id: result._id, // Usar _id que es lo que devuelve MongoDB
          title: result.title,
          description: result.description,
          url: result.url,
          image: result.image || '',
          tags: result.tags || []
        };
        setPosts(prevPosts => [...prevPosts, newPost]);
      }

      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Éxito!',
        text: editingPost ? 'Post actualizado correctamente' : 'Post creado correctamente',
        icon: 'success',
        confirmButtonColor: '#232122',
        timer: 2000,
        timerProgressBar: true
      });

      // Cerrar el formulario
      handleCloseForm();

    } catch (err: any) {
      console.error('Error en handleSubmit:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        response: err.response
      });
      
      // Mostrar mensaje de error detallado
      Swal.fire({
        title: 'Error',
        text: err.message || 'Ocurrió un error al procesar la solicitud',
        icon: 'error',
        confirmButtonColor: '#232122'
      });
      
      // No cerrar el formulario en caso de error
      return;
    }
};

useEffect(() => {
  // Al montar, traemos todos los links
  fetch(`${API_BASE}/links`)
    .then(res => res.json())
    .then((raw: any[]) => {
      const normalized: Post[] = raw.map(l => ({
        id: l._id,               // <- aquí
        title: l.title,
        description: l.description,
        image: l.image || '',
        url: l.url,
        tags: l.tags || []
      }));
      setPosts(normalized);
    })
    .catch(err => console.error('Error cargando posts:', err));
}, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-user-info">
  <h2>Bienvenido, {localStorage.getItem('username')}</h2>
  <p>{userEmail}</p>
</div>
        <div className="admin-buttons-container">
          <button 
            className="create-post-button"
            onClick={handleCreatePost}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Crear nuevo post
          </button>
          <button 
            className="back-to-board-button"
            onClick={() => navigate('/recursos')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Regresar al tablón
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="admin-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            Buscar
          </button>
        </div>

        <div className="posts-table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Imagen</th>
                <th>URL</th>
                <th>Etiquetas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td className="description-cell">{post.description}</td>
                  <td>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="post-thumbnail"
                    />
                  </td>
                  <td>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      Ver post
                    </a>
                  </td>
                  <td>
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="post-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(post.id)}
                      aria-label="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(post.id)}
                      aria-label="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear Post */}
      {showPostForm && (
        <div className="modal-overlay">
          <div className="post-form-container">
            <div className="post-form-header">
              <h2>{editingPost ? 'Editar Post' : 'Crear Post'}</h2>
              <button className="close-form-btn" onClick={handleCloseForm}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="post-form">
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Título del post"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Descripción del post"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="url">URL del recurso</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com"
                  pattern="https?://.+"
                  title="Por favor ingresa una URL válida que comience con http:// o https://"
                />
                <small className="field-hint">Opcional - Asegúrate de incluir http:// o https://</small>
              </div>
              
              <div className="form-group">
                <label>Imagen</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="upload-image-btn"
                  onClick={triggerFileInput}
                >
                  Subir Imagen
                </button>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Etiquetas</label>
                <div className="tags-container">
                  {TAGS_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag ${formData.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCloseForm}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
