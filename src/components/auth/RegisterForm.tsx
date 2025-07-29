import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import './RegisterForm.css';

const API_BASE = 'http://localhost:3000'; // Removido /api para evitar duplicación

interface RegisterFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ onClose, onSwitchToLogin }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Estados para las reglas de la contraseña
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    noSpaces: true,
    onlyLettersAndNumbers: true
  });

  const validateUsername = (username: string) => {
    const re = /^[A-Za-z]+(?: [A-Za-z]+)?$/;
    return re.test(username);
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const formatEmail = (email: string) => {
    return email.toLowerCase().trim();
  };

  const navigate = useNavigate();
  const { login } = useAuth();

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
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      isValid = false;
    } else if (!passwordRules.hasUpperCase) {
      setPasswordError('La contraseña debe contener al menos una mayúscula');
      isValid = false;
    } else if (!passwordRules.noSpaces) {
      setPasswordError('La contraseña no debe contener espacios');
      isValid = false;
    } else if (!passwordRules.onlyLettersAndNumbers) {
      setPasswordError('La contraseña solo puede contener letras y números');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) return;

    try {
      // 1. Registrar al usuario
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim(),
          email: formatEmail(email),
          password: password
        })
      });

      const body = await res.json();

      if (!res.ok) {
        // Manejar errores específicos del servidor
        if (body.error && body.error.includes('E11000')) {
          throw new Error('El correo electrónico ya está registrado');
        }
        throw new Error(body.error || 'Error al registrar el usuario');
      }

      // 2. Iniciar sesión automáticamente después del registro exitoso
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: formatEmail(email),
          password: password
        })
      });

      const loginBody = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginBody.error || 'Error al iniciar sesión después del registro');
      }

      // 3. Actualizar contexto de autenticación
      const userData = {
        id: loginBody._id || Date.now().toString(),
        name: username.trim(),
        email: formatEmail(email),
        role: loginBody.role || 'user'
      };
      
      // Guardar en localStorage
      localStorage.setItem('username', userData.name);
      localStorage.setItem('email', userData.email);
      
      // Actualizar el estado de autenticación
      login(userData);

      // Cerrar el modal de registro
      onClose();
      
      // Mostrar mensaje de éxito
      const result = await Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: `¡Bienvenido/a a Devpendencias, ${userData.name}!`,
        confirmButtonText: userData.role === 'admin' ? 'Ir al panel' : 'Comenzar',
        confirmButtonColor: '#232122',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showCancelButton: false,
        showCloseButton: false
      });

      // Redirigir según el rol
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        window.location.href = userData.role === 'admin' ? '/admin' : '/recursos';
      }
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: err.message || 'Ocurrió un error al intentar registrarse. Por favor, inténtalo de nuevo.'
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
    if (value === '' || /^[A-Za-z ]*$/.test(value)) {
      if (value.split(' ').length <= 2) {
        setUsername(value);
      }
    }
  };

  // Formatear el correo electrónico mientras se escribe
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/\s/.test(value)) {
      setEmail(value);
    }
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
    
    // Validar coincidencia de contraseñas
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Manejar cambio en la confirmación de contraseña
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (password !== value) {
      setConfirmPasswordError('Las contraseñas no coinciden');
    } else {
      setConfirmPasswordError('');
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

  return (
    <AnimatePresence>
      <motion.div
        className="register-overlay"
        onClick={handleOverlayClick}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      >
        <motion.div
          className="register-container"
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
          
          <div className="register-content">
            <div className="register-header">
              <span className="register-badge">NUEVA CUENTA</span>
              <h2>¡Únete a nuestra comunidad!</h2>
              <p className="register-subtitle">Completa el formulario para crear tu cuenta</p>
            </div>
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={usernameError ? 'error' : ''}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
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
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                />
                {emailError && <span className="error-message">{emailError}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
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
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={confirmPasswordError ? 'error' : ''}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirmPassword ? (
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
                {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
              </div>
              
              <motion.button
                type="submit"
                className="register-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Crear mi cuenta
              </motion.button>
              
              <div className="form-footer">
                <p>¿Ya tienes una cuenta?{' '}
                  <button 
                    type="button" 
                    className="toggle-form-link"
                    onClick={onSwitchToLogin}
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegisterForm;
