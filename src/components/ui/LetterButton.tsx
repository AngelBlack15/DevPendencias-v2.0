import React from 'react';
import { Link } from 'react-router-dom';

interface LetterButtonProps {
  text: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  to?: string;
}

const LetterButton: React.FC<LetterButtonProps> = ({
  text,
  className = '',
  type = 'button',
  onClick,
  to
}) => {
  // Convertir el texto en letras individuales
  const letters = text.split('');
  const content = (
    <>
      <div className="original">{text}</div>
      <div className="letters">
        {letters.map((letter, index) => (
          <span key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
    </>
  );

  if (to) {
    return (
      <Link 
        to={to} 
        className={`btn-53 ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      className={`btn-53 ${className}`} 
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  );
};

export default LetterButton;
