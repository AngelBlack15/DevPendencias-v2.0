import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import './SignupForm.css';

interface SignupFormProps {
  onClose: () => void;
}

const API_BASE = 'http://localhost:3000/api';

const SignupForm: React.FC<SignupFormProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... otros estados y validaciones ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... validaciones ...
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) throw new Error('Error al registrar');
      const body = await res.json();
      await Swal.fire('¡Listo!', 'Registro exitoso', 'success');
      onClose();
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" /* variants… */ >
        <motion.div className="modal-box" /* variants… */ >
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>Regístrate</h2>
          <form onSubmit={handleSubmit}>
            {/* campos de usuario, email, contraseña */}
            <button type="submit">Crear cuenta</button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupForm;
