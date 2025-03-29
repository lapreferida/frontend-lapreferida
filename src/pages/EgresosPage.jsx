import { useState } from "react";
import "../styles/egresosPage.css";
import { FaPlus, FaTrash, FaEdit, FaChartPie, FaListAlt } from "react-icons/fa";

const EgresosPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ concept: "", amount: "", date: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddExpense = () => {
    if (!form.concept || !form.amount || !form.date) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setExpenses([...expenses, { ...form, id: Date.now() }]);
    setForm({ concept: "", amount: "", date: "" });
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + parseFloat(expense.amount || 0),
    0
  );

  return (
    <div className="container">
      <header className="expenses-header">
        <h1>Gastos</h1>
      </header>

      <div className="expenses-content">
        {/* Formulario */}
        <div className="form-container-egresos">
          <h2 className="titulo-sec-gastos">Agregar Gastos</h2>
          <div className="form-group">
            <label htmlFor="concept">Concepto:</label>
            <input
              type="text"
              id="concept"
              name="concept"
              value={form.concept}
              onChange={handleInputChange}
              placeholder="Ej. Compra de harina"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Monto:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={form.amount}
              onChange={handleInputChange}
              placeholder="Ej. 500"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
            />
          </div>

          <button className="add-button" onClick={handleAddExpense}>
            <FaPlus /> Agregar
          </button>
        </div>

        {/* Resumen */}
        <div className="summary-container">
          <h2 className="titulo-sec-gastos">Resumen del dia</h2>
          <div className="summary-card">
            <FaListAlt className="summary-icon" />
            <p>Total de egresos: {expenses.length}</p>
          </div>
          <div className="summary-card">
            <FaChartPie className="summary-icon" />
            <p>Monto total: ${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Listado de Egresos */}
      <div className="expenses-list">
        <h2 className="titulo-sec-gastos">Listado de Egresos</h2>
        {expenses.length === 0 ? (
          <p>No hay egresos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.concept}</td>
                  <td>${expense.amount}</td>
                  <td>{expense.date}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => alert("Funcionalidad en desarrollo")}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EgresosPage;
