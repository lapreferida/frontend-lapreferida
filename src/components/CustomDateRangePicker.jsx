// src/components/CustomDateRangePicker.jsx
import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
// Importamos la localización en español
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css"; // estilos principales
import "react-date-range/dist/theme/default.css"; // tema por defecto

const CustomDateRangePicker = ({ startDate, endDate, onRangeChange }) => {
  // Guardamos el rango de fechas en un array, como lo maneja react-date-range
  const [range, setRange] = useState([
    {
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      key: "selection",
    },
  ]);

  // Controla si se muestra u oculta el calendario
  const [open, setOpen] = useState(false);

  // Referencia para detectar clicks fuera y cerrar el calendario
  const refOne = useRef(null);

  useEffect(() => {
    // Escuchamos clicks en el documento para cerrar el calendario si hacen clic fuera
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  // Cada vez que cambie el rango, notificamos al padre con las nuevas fechas
  useEffect(() => {
    if (onRangeChange) {
      onRangeChange(range[0].startDate, range[0].endDate);
    }
  }, [range, onRangeChange]);

  const handleClickOutside = (e) => {
    if (refOne.current && !refOne.current.contains(e.target)) {
      setOpen(false);
    }
  };

  return (
    <div className="calendarWrap" style={{ position: "relative" }}>
      {/* Input “falso” que muestra el rango en texto */}
      <input
        type="text"
        readOnly
        value={`${format(range[0].startDate, "dd/MM/yyyy", { locale: es })} - ${format(
          range[0].endDate,
          "dd/MM/yyyy",
          { locale: es }
        )}`}
        className="inputBox"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          cursor: "pointer",
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          width: "220px",
        }}
      />

      {/* Contenedor del calendario */}
      {open && (
        <div
          ref={refOne}
          style={{
            position: "absolute",
            top: "50px",
            zIndex: 9999,
          }}
        >
          <DateRange
            onChange={(item) => setRange([item.selection])}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={2} /* Muestra 2 meses a la vez */
            direction="horizontal"
            className="calendarElement"
            locale={es} /* <-- Importante para mostrar en español */
          />
        </div>
      )}
    </div>
  );
};

export default CustomDateRangePicker;
