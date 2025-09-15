from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mi_base_local.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo de jefe
class jefe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    compania = db.Column(db.String(100), nullable=True)

# Modelo de trabajador
class trabajador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    jefe_id = db.Column(db.Integer, db.ForeignKey('jefe.id'), nullable=False)
    guantes = db.Column(db.Boolean, default=False)
    casco = db.Column(db.Boolean, default=False)
    botas = db.Column(db.Boolean, default=False)
    lentes = db.Column(db.Boolean, default=False)
    zapatos_seg = db.Column(db.Boolean, default=False)
    
class epp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, nullable=False)

class botas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_de_compra = db.Column(db.Date, nullable=False)
    venc = db.Column(db.Date, nullable=False)

class lentes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_de_compra = db.Column(db.Date, nullable=False)
    venc = db.Column(db.Date, nullable=False)

class guantes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_de_compra = db.Column(db.Date, nullable=False)
    venc = db.Column(db.Date, nullable=False)
    
class casco(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_de_compra = db.Column(db.Date, nullable=False)
    venc = db.Column(db.Date, nullable=False)
    
# --- Rutas API ---

@app.route("/api/trabajadores", methods=["GET"])
def get_trabajadores():
    trabajadores_db = trabajador.query.all()
    lista = [{
        "id": t.id,
        "nombre": t.nombre,
        "guantes": t.guantes,
        "casco": t.casco,
        "botas": t.botas,
        "lentes": t.lentes,
        "zapatos_seg": t.zapatos_seg
    } for t in trabajadores_db]
    return jsonify(lista)

@app.route("/api/trabajadores", methods=["POST"])
def crear_trabajador():
    data = request.get_json()
    nombre = data.get("nombre")
    jefe_id = data.get("jefe_id", 1)  # por defecto admin
    if not nombre:
        return jsonify({"success": False, "message": "Falta nombre"}), 400

    nuevo = trabajador(nombre=nombre, contrasena="", jefe_id=jefe_id)
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({
        "success": True,
        "trabajador": {
            "id": nuevo.id,
            "nombre": nuevo.nombre,
            "guantes": nuevo.guantes,
            "casco": nuevo.casco,
            "botas": nuevo.botas,
            "lentes": nuevo.lentes,
            "zapatos_seg": nuevo.zapatos_seg
        }
    })

@app.route("/api/trabajadores/<int:id>", methods=["PUT"])
def update_trabajador(id):
    t = trabajador.query.get_or_404(id)
    data = request.get_json()
    for field in ["guantes", "casco", "botas", "lentes", "zapatos_seg"]:
        if field in data:
            setattr(t, field, data[field])
    db.session.commit()
    return jsonify({"success": True})

@app.route("/api/trabajadores/<int:id>", methods=["DELETE"])
def eliminar_trabajador(id):
    t = trabajador.query.get(id)
    if not t:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"success": True})

# --- Crear datos de prueba al iniciar ---
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # Crear jefe admin si no existe
        admin = jefe.query.filter_by(nombre="admin").first()
        if not admin:
            admin = jefe(nombre="admin", contrasena="admin")
            db.session.add(admin)
            db.session.commit()

        # Crear trabajadores de ejemplo si tabla vacía
        if not trabajador.query.first():
            t1 = trabajador(nombre="Juan", contrasena="", jefe_id=admin.id, guantes=True, casco=False, botas=False, lentes=True, zapatos_seg=True)
            t2 = trabajador(nombre="María", contrasena="", jefe_id=admin.id, guantes=False, casco=True, botas=True, lentes=False, zapatos_seg=False)
            db.session.add_all([t1, t2])
            db.session.commit()

    app.run(debug=True, port=5000)
