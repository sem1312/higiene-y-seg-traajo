import { useState } from "react"
import Checkboxes from "./components/Checkboxes"
import Modal from "./components/Modal"
import imagen from "./assets/konatapat.png"

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ padding: "20px" }}>
      <h1>Control de EPP+</h1>

      <Checkboxes />

      <button
        onClick={() => setShowModal(true)}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        ?
      </button>

      <Modal show={showModal} onClose={() => setShowModal(false)} image={imagen} />
    </div>
  )
}

export default App
