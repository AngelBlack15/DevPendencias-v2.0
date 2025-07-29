import React from 'react';

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className={`clear-filters ${className}`}
    >
      <span className="button__text">Limpiar filtros</span>
      <span className="button__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="512" viewBox="0 0 512 512" height="512" className="svg">
          <title>Eliminar filtros</title>
          <path style={{fill:'none',stroke:'#fff',strokeLinecap:'round',strokeLinejoin:'round',strokeWidth:'32px'}} d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"></path>
          <line y2="112" y1="112" x2="432" x1="80" style={{stroke:'#fff',strokeLinecap:'round',strokeMiterlimit:10,strokeWidth:'32px'}}></line>
          <path style={{fill:'none',stroke:'#fff',strokeLinecap:'round',strokeLinejoin:'round',strokeWidth:'32px'}} d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"></path>
          <line y2="400" y1="176" x2="256" x1="256" style={{fill:'none',stroke:'#fff',strokeLinecap:'round',strokeLinejoin:'round',strokeWidth:'32px'}}></line>
          <line y2="400" y1="176" x2="192" x1="184" style={{fill:'none',stroke:'#fff',strokeLinecap:'round',strokeLinejoin:'round',strokeWidth:'32px'}}></line>
          <line y2="400" y1="176" x2="320" x1="328" style={{fill:'none',stroke:'#fff',strokeLinecap:'round',strokeLinejoin:'round',strokeWidth:'32px'}}></line>
        </svg>
      </span>
    </button>
  );
};

export default ClearFiltersButton;
