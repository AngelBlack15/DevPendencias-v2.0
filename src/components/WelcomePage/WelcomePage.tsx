import React from 'react';
import AnimatedButton from '../ui/AnimatedButton';
import LetterButton from '../ui/LetterButton';

// Importing images from devpendenciasIMG directory
const logo = '/devpendenciasIMG/logobros.svg';
const backgroundImage = '/devpendenciasIMG/backwelcome.jpg';

const WelcomePage: React.FC = () => {
  const handleContactClick = () => {
    // Handle contact button click
    console.log('Contact button clicked');
  };

  // La navegación se manejará a través del enlace en el botón

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/vite.svg';
          }} />
        </div>
        <AnimatedButton 
          text="Contáctanos" 
          onClick={handleContactClick}
          color="#232122"
          hoverTextColor="#ffffff"
          className="publish-button"
        />
      </header>

      {/* Hero Section */}
      <section className="hero">
        {/* Background Image */}
        <div className="background-image-container">
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="background-image"
            onError={(e) => {
              // Fallback in case the image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const container = target.parentElement;
              if (container) {
                container.style.backgroundColor = '#232122';
              }
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          {/* Left side - Visit Button */}
          <div className="hero-left">
            <LetterButton 
              text="Visitar Recursos" 
              to="/recursos"
              className="visit-button"
            />
          </div>

          {/* Right side - Text Content */}
          <div className="hero-right">
            <h1 className="hero-title">
              <span className="dev-text">Dev</span>
              <br />
              <span className="pendencias-text">pendencias</span>
            </h1>
            <h2 className="hero-subtitle">Bienvenido a Devpendencias:</h2>
            <p className="hero-text">
              Tu biblioteca infinita de herramientas para desarrolladores
              <br /><br />
              En el vasto universo de la programación, cada línea de código cuenta. Cada herramienta, cada librería, cada dependencia es un eslabón que transforma ideas en realidades digitales. Devpendencias nace como el punto de encuentro definitivo para desarrolladores de todos los niveles, un repositorio vivo donde la innovación se encuentra con la eficiencia.
              <br /><br />
              Aquí no solo descubrirás las librerías más populares y esenciales para tu stack, sino también joyas ocultas, herramientas emergentes y soluciones que pueden potenciar tu código más allá de los límites convencionales. No importa si eres backend, frontend, fullstack, mobile, gamer, o científico de datos: si existe, está aquí.
              <br /><br />
              <span className="feature">📌 Miles de recursos organizados para que encuentres justo lo que necesitas.</span>
              <span className="feature">📌 Exploración constante de nuevas tecnologías, frameworks y paquetes.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
