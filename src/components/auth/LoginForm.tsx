// devpendencias-ui/src/components/auth/LoginForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import './LoginForm.css';

const API_BASE = 'http://localhost:3000/api';

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm = ({ onClose, onSwitchToRegister }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Estados para las reglas de la contraseña
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    noSpaces: true,
    onlyLettersAndNumbers: true
  });

  const validateUsername = (username: string) => {
    // Solo letras mayúsculas y minúsculas, con un solo espacio permitido
    const re = /^[A-Za-z]+(?: [A-Za-z]+)?$/;
    return re.test(username);
  };

  const validateEmail = (email: string) => {
    // Validación más estricta de correo electrónico
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const formatEmail = (email: string) => {
    // Convertir a minúsculas y eliminar espacios en blanco
    return email.toLowerCase().trim();
  };



  const navigate = useNavigate();
const { login } = useAuth();
  // Sustituye toda la función handleSubmit por esta versión
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  let isValid = true;

  // Validar nombre de usuario
  if (!username) {
    setUsernameError('El nombre de usuario es requerido');
    isValid = false;
  } else if (!validateUsername(username)) {
    setUsernameError('Solo se permiten letras y un espacio como máximo');
    isValid = false;
  } else if (username.length < 3) {
    setUsernameError('El nombre debe tener al menos 3 caracteres');
    isValid = false;
  } else {
    setUsernameError('');
  }

  // Validar email
  const formattedEmail = formatEmail(email);
  if (!formattedEmail) {
    setEmailError('El correo electrónico es requerido');
    isValid = false;
  } else if (!validateEmail(formattedEmail)) {
    setEmailError('Por favor ingresa un correo electrónico válido');
    isValid = false;
  } else {
    setEmailError('');
  }

  // Validar contraseña
  if (!password) {
    setPasswordError('La contraseña es requerida');
    isValid = false;
  } else if (password.length < 6) {
    setPasswordError('La contraseña debe tener al menos 6 caracteres');
    isValid = false;
  } else {
    setPasswordError('');
  }

  if (!isValid) return;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        email: formatEmail(email),
        password
      })
    });
    const body = await res.json();

    if (!res.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: body.error || 'Error al iniciar sesión'
      });
      return;
    }

    // Ahora esperamos que tu backend devuelva también el _id
    const { _id, name, role } = body as {
      _id: string;
      name: string;
      role: 'admin' | 'user';
    };

    // Actualizamos contexto con el User completo (incluyendo id)
    const userData = {
      id: _id,
      name,
      email: formatEmail(email),
      role
    };
    localStorage.setItem('username', name);
    localStorage.setItem('email', formatEmail(email));
    login(userData);

    // Cerrar el modal de inicio de sesión
    onClose();
    
    // Mostrar mensaje de bienvenida
    const result = await Swal.fire({
      icon: 'success',
      title: role === 'admin' ? '¡Bienvenido administrador!' : '¡Bienvenido!',
      text: `Hola, ${name}`,
      confirmButtonText: role === 'admin' ? 'Ir al panel' : 'Continuar',
      confirmButtonColor: '#232122',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showCancelButton: false,
      showCloseButton: false
    });
    
    // Recargar la página para asegurar que se actualice el estado
    // Usamos window.location.href en lugar de navigate para forzar recarga completa
    if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
      window.location.href = role === 'admin' ? '/admin' : '/recursos';
    }
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message
    });
  }
};


  // Efecto para deshabilitar el scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Formatear el nombre de usuario mientras se escribe
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo actualizar si el valor cumple con el formato o está vacío
    if (value === '' || /^[A-Za-z ]*$/.test(value)) {
      // Limitar a un solo espacio
      if (value.split(' ').length <= 2) {
        setUsername(value);
      }
    }
  };

  // Formatear el correo electrónico mientras se escribe
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // No permitir espacios en blanco
    if (!/\s/.test(value)) {
      setEmail(value);
    }
  };

  // Animaciones
  const overlayVariants = {
    hidden: { 
      opacity: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const 
      } 
    },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const 
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const 
      }
    }
  };

  const containerVariants = {
    hidden: { 
      scale: 0.95, 
      opacity: 0,
      y: 20
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 300,
        delay: 0.1
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 300
      }
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  // Validar las reglas de la contraseña
  const validatePasswordRules = (pass: string) => {
    setPasswordRules({
      minLength: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      noSpaces: !/\s/.test(pass),
      onlyLettersAndNumbers: /^[A-Za-z0-9]*$/.test(pass)
    });
  };

  // Manejar cambio en la contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePasswordRules(value);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="login-overlay"
        onClick={handleOverlayClick}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      >
        <motion.div
          className="login-box"
          onClick={(e) => e.stopPropagation()}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="login-content">
            <h2>¡Bienvenido!</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={usernameError ? 'error' : ''}
                  placeholder="Tu nombre"
                  autoComplete="username"
                />
                {usernameError && <span className="error-message">{usernameError}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailError ? 'error' : ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setShowPasswordRules(true)}
                    onBlur={() => setShowPasswordRules(false)}
                    className={passwordError ? 'error' : ''}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && <span className="error-message">{passwordError}</span>}
                
                {/* Reglas de la contraseña */}
                {showPasswordRules && (
                  <div className="password-rules">
                    <p className={passwordRules.minLength ? 'valid' : ''}>
                      {passwordRules.minLength ? '✓ ' : '• '} Mínimo 8 caracteres
                    </p>
                    <p className={passwordRules.hasUpperCase ? 'valid' : ''}>
                      {passwordRules.hasUpperCase ? '✓ ' : '• '} Al menos una mayúscula
                    </p>
                    <p className={passwordRules.noSpaces ? 'valid' : 'invalid'}>
                      {passwordRules.noSpaces ? '✓ ' : '• '} Sin espacios
                    </p>
                    <p className={passwordRules.onlyLettersAndNumbers ? 'valid' : 'invalid'}>
                      {passwordRules.onlyLettersAndNumbers ? '✓ ' : '• '} Solo letras y números
                    </p>
                  </div>
                )}
              </div>
              <motion.button
                type="submit"
                className="login-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Iniciar Sesión
              </motion.button>
            </form>
            
            <div className="form-footer">
              <button 
                type="button" 
                className="toggle-form-link"
                onClick={onSwitchToRegister}
              >
                Regístrate aquí
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginForm;