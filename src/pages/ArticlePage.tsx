import React from 'react';
import Article from '../components/Article/Article';

// Datos de ejemplo - En una aplicación real, estos vendrían de tu API
const exampleArticle = {
  title: 'Título de la Herramienta o Artículo',
  description: 'Esta es una descripción detallada de la herramienta o artículo. Aquí puedes incluir toda la información relevante, características principales, cómo funciona, y cualquier otro detalle que quieras compartir con los usuarios.\n\nPuedes incluir múltiples párrafos para organizar mejor la información y hacerla más legible para los lectores.',
  imageUrl: 'https://via.placeholder.com/1200x600/00bcd4/ffffff?text=Imagen+de+Ejemplo',
  tags: ['Herramienta', 'Productividad', 'Desarrollo'],
  url: 'https://ejemplo.com/herramienta'
};

const ArticlePage: React.FC = () => {
  return (
    <Article 
      title={exampleArticle.title}
      description={exampleArticle.description}
      imageUrl={exampleArticle.imageUrl}
      tags={exampleArticle.tags}
      url={exampleArticle.url}
    />
  );
};

export default ArticlePage;
