from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde Vite (localhost:5173)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Configuración de la base de datos
db_uri = 'mysql+pymysql://u31s95e6mllvngxm:N9Ca1ot2FkezF82duBRM@bhtttaanhzhkagixcuvw-mysql.services.clever-cloud.com:3306/bhtttaanhzhkagixcuvw'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app, engine_options={"pool_pre_ping": True})

# Modelo de usuario
class jefe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    compania = db.column(db.String(100))
class trabajador(db.model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    jefe_id = db.Column(db.Integer, db.ForeignKey('jefe.id'), nullable=False)
    #EPP_traqbajador
    guantes = db.Column(db.Boolean, default=False)
    casco = db.Column(db.Boolean, default=False)
    botas = db.Column(db.Boolean, default=False)
    lentes = db.Column(db.Boolean, default=False)
    botas = db.Column(db.Boolean, default=False)
    zapatos_seg = db.Column(db.Boolean, default=False)



# Ruta de prueba para backend funcionando
@app.route("/")
def home():
    return jsonify({"message": "✅ Backend funcionando en Flask"})

# Ruta de login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    nombre = data.get("nombre")
    contrasena = data.get("contrasena")

    if not nombre or not contrasena:
        return jsonify({"success": False, "message": "Faltan campos"}), 400

    usuario = Usuario.query.filter_by(nombre=nombre, contrasena=contrasena).first()

    if usuario:
        return jsonify({"success": True, "message": "Login exitoso"})
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401

# Crear usuario de prueba al arrancar
if __name__ == "__main__":
    with app.app_context():
        if not Usuario.query.filter_by(nombre="admin").first():
            nuevo_usuario = Usuario(nombre="admin", contrasena="admin")
            db.session.add(nuevo_usuario)
            db.session.commit()
    app.run(debug=True, port=5000)
