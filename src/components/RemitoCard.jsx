const RemitoCard = ({ remito }) => {
    return (
      <div className="remito-card">
        <div className="remito-card-left">
          <h3>Remito {remito.numero_remito}</h3>
          <p>
            <strong>Fecha:</strong> {new Date(remito.fecha).toLocaleDateString()}
          </p>
          <p>
            <strong>Subtotal:</strong> ${parseFloat(remito.subtotal).toFixed(2)}
          </p>
          <p>
            <strong>Observaciones:</strong> {remito.observaciones}
          </p>
        </div>
        {remito.detalle && remito.detalle.length > 0 && (
          <div className="remito-card-right">
            <h4>Detalle</h4>
            <ul>
              {remito.detalle.map((item) => (
                <li key={item.id}>
                  {item.nombre} - {item.cantidad} {item.unidad_medida} - $
                  {parseFloat(item.subtotal).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default RemitoCard;
  