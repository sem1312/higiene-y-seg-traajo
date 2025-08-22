import { useState } from "react"

function Checkboxes() {
  const [selected, setSelected] = useState({
    casco: false,
    guantes: false,
    lentes: false,
    tanga: false,
  })

  const handleChange = (e) => {
    const { name, checked } = e.target
    setSelected((prev) => ({ ...prev, [name]: checked }))
  }

  return (
    <div>
      <h2>Elementos de seguridad</h2>

      {Object.keys(selected).map((item) => (
        <label key={item} style={{ display: "block", marginBottom: "5px" }}>
          <input
            type="checkbox"
            name={item}
            checked={selected[item]}
            onChange={handleChange}
          />
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </label>
      ))}

      <div style={{ marginTop: "20px" }}>
        <strong>Seleccionados:</strong>{" "}
        {Object.keys(selected).filter((k) => selected[k]).join(", ") || "Ninguno"}
      </div>
    </div>
  )
}

export default Checkboxes