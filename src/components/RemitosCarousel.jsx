import { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import RemitoCard from './RemitoCard';


const RemitosCarousel = ({ remitos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!remitos || remitos.length === 0) {
    return <p>No hay remitos vinculados.</p>;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? remitos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === remitos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="remitos-carousel">
      {remitos.length > 1 && (
        <button type="button" className="carousel-btn prev" onClick={handlePrev}>
          <FaArrowLeft />
        </button>
      )}

      <div className="carousel-card-container">
        <RemitoCard remito={remitos[currentIndex]} />
      </div>

      {remitos.length > 1 && (
        <button type="button" className="carousel-btn next" onClick={handleNext}>
          <FaArrowRight />
        </button>
      )}

      {remitos.length > 1 && (
        <div className="carousel-indicator">
          {currentIndex + 1} de {remitos.length}
        </div>
      )}
    </div>
  );
};

export default RemitosCarousel;
