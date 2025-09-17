from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Compania, Jefe, Trabajador, EPP, EPPItem
from datetime import date, datetime
from werkzeug.utils import secure_filename
import os

# ----------------- CONFIG -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mi_base_local.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

db.init_app(app)

# ----------------- HELPERS -----------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------- LOGIN -----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    nombre = data.get("nombre")
    contrasena = data.get("contrasena")
    if not nombre or not contrasena:
        return jsonify({"success": False, "message": "Faltan datos"}), 400
    user = Jefe.query.filter_by(nombre=nombre).first()
    if user and user.contrasena == contrasena:
        return jsonify({"success": True, "message": "Login correcto", "jefe_id": user.id, "compania_id": user.compania_id})
    return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401

# ----------------- REGISTRAR COMPAÑIA -----------------
@app.route("/api/registrar_compania", methods=["POST"])
def registrar_compania():
    data = request.get_json()
    nombre = data.get("nombre")
    if not nombre:
        return jsonify({"success": False, "message": "Falta el nombre"}), 400
    if Compania.query.filter_by(nombre=nombre).first():
        return jsonify({"success": False, "message": "La compañía ya existe"}), 400
    nueva = Compania(nombre=nombre)
    db.session.add(nueva)
    db.session.commit()
    return jsonify({"success": True, "compania_id": nueva.id})

# ----------------- REGISTRAR JEFE -----------------
@app.route("/api/registrar_jefe", methods=["POST"])
def registrar_jefe():
    data = request.get_json()
    nombre = data.get("nombre")
    contrasena = data.get("contrasena")
    compania_id = data.get("compania_id")
    if not nombre or not contrasena or not compania_id:
        return jsonify({"success": False, "message": "Faltan datos"}), 400
    if Jefe.query.filter_by(nombre=nombre).first():
        return jsonify({"success": False, "message": "El usuario ya existe"}), 400
    jefe = Jefe(nombre=nombre, contrasena=contrasena, compania_id=compania_id)
    db.session.add(jefe)
    db.session.commit()
    return jsonify({"success": True, "jefe_id": jefe.id})

@app.route("/api/trabajadores", methods=["GET"])
def get_trabajadores():
    jefe_id = request.args.get("jefe_id", type=int)
    if not jefe_id:
        return jsonify([])
    trabajadores = Trabajador.query.filter_by(jefe_id=jefe_id).all()
    lista = []
    for t in trabajadores:
        lista.append({
            "id": t.id,
            "nombre": t.nombre,
            "apellido": t.apellido,
            "telefono": t.telefono,
            "direccion": t.direccion,
            "dni": t.dni,
            "email": t.email,
            "compania_id": t.compania_id,
            "epps_asignados": [
                {
                    "id": e.id,
                    "tipo": e.epp.tipo,
                    "nombre": e.epp.nombre,
                    "fecha_compra": e.fecha_compra.isoformat(),
                    "fecha_vencimiento": e.fecha_vencimiento.isoformat() if e.fecha_vencimiento else None,
                    "imagen_url": e.epp.imagen_url
                } for e in t.epps_items
            ]
        })
    return jsonify(lista)


@app.route("/api/trabajadores", methods=["POST"])
def crear_trabajador():
    data = request.get_json()
    nombre = data.get("nombre")
    apellido = data.get("apellido")
    telefono = data.get("telefono")
    direccion = data.get("direccion")
    dni = data.get("dni")
    email = data.get("email")
    jefe_id = data.get("jefe_id")

    if not nombre or not jefe_id:
        return jsonify({"success": False, "message": "Faltan datos"}), 400

    jefe = db.session.get(Jefe, jefe_id)
    if not jefe:
        return jsonify({"success": False, "message": "Jefe no encontrado"}), 404

    t = Trabajador(
        nombre=nombre,
        apellido=apellido,
        telefono=telefono,
        direccion=direccion,
        dni=dni,
        email=email,
        jefe_id=jefe_id,
        compania_id=jefe.compania_id
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({
        "success": True,
        "id": t.id,
        "nombre": t.nombre,
        "apellido": t.apellido
    })


@app.route("/api/trabajadores/<int:id>", methods=["DELETE"])
def eliminar_trabajador(id):
    t = Trabajador.session.get(id)
    if not t:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"success": True})

# ----------------- EPP -----------------
@app.route("/api/epp", methods=["POST"])
def crear_epp():
    tipo = request.form.get("tipo")
    nombre = request.form.get("nombre")
    compania_id = request.form.get("compania_id")  # <- recibimos compania_id ahora
    stock = request.form.get("stock", 1)

    # Validación básica
    if not tipo or not nombre or not compania_id:
        return jsonify({"success": False, "message": "Faltan datos"}), 400

    try:
        compania_id = int(compania_id)
        stock = int(stock)
        if stock < 1:
            stock = 1
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "compania_id o stock inválido"}), 400

    # Verificar unicidad por compañía
    existente = EPP.query.filter_by(compania_id=compania_id, nombre=nombre).first()
    if existente:
        return jsonify({"success": False, "message": "Ya existe un EPP con ese nombre para esta compañía"}), 400

    fecha_compra_str = request.form.get("fecha_compra")
    try:
        fecha_compra = datetime.strptime(fecha_compra_str, "%Y-%m-%d").date() if fecha_compra_str else date.today()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de fecha inválido"}), 400

    imagen_url = None
    if "imagen" in request.files:
        file = request.files["imagen"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            imagen_url = f"uploads/{filename}"

    # Crear EPP
    epp = EPP(
        tipo=tipo,
        nombre=nombre,
        compania_id=compania_id,
        fecha_compra=fecha_compra,
        fecha_vencimiento=None,
        imagen_url=imagen_url
    )
    db.session.add(epp)
    db.session.commit()

    # Crear EPPItems según stock
    for _ in range(stock):
        item = EPPItem(
            epp_id=epp.id,
            disponible=True,
            fecha_compra=fecha_compra
        )
        db.session.add(item)
    db.session.commit()

    return jsonify({
        "success": True,
        "id": epp.id,
        "nombre": epp.nombre,
        "tipo": epp.tipo,
        "stock": stock,
        "fecha_de_compra": epp.fecha_compra.isoformat(),
        "imagen_url": epp.imagen_url,
        "compania_id": epp.compania_id
    })


@app.route("/api/companias", methods=["GET"])
def get_companias():
    companias = Compania.query.all()
    lista = [{"id": c.id, "nombre": c.nombre} for c in companias]
    return jsonify(lista)


# ----------------- ASIGNAR EPP -----------------
@app.route("/api/asignar_epp", methods=["POST"])
def asignar_epp():
    data = request.get_json()
    trabajador_id = data.get("trabajador_id")
    epp_id = data.get("epp_id")

    trabajador = Trabajador.query.get(trabajador_id)
    if not trabajador:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404

    # Buscar si ya tiene este EPP asignado
    item = EPPItem.query.filter_by(epp_id=epp_id, trabajador_id=trabajador_id).first()
    if item:
        # Desasignar
        item.trabajador_id = None
        item.disponible = True
        action = "desasignado"
    else:
        # Asignar un item disponible
        item = EPPItem.query.filter_by(epp_id=epp_id, disponible=True).first()
        if not item:
            return jsonify({"success": False, "message": "No hay stock disponible"}), 400
        item.trabajador_id = trabajador_id
        item.disponible = False
        action = "asignado"

    db.session.commit()
    return jsonify({"success": True, "message": f"EPP {action} correctamente"})

# ----------------- ACTUALIZAR EPPs DEL TRABAJADOR -----------------
@app.route("/api/actualizar_epps_trabajador", methods=["POST"])
def actualizar_epps_trabajador():
    data = request.get_json()
    trabajador_id = data.get("trabajador_id")
    epp_ids = data.get("epp_ids", [])

    trabajador = Trabajador.query.get(trabajador_id)
    if not trabajador:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404

    # Liberar todos los EPPItems asignados previamente
    for item in trabajador.epps_items:
        item.disponible = True
        item.trabajador_id = None

    db.session.commit()

    # Asignar los nuevos EPPs
    for epp_id in epp_ids:
        item = EPPItem.query.filter_by(epp_id=epp_id, disponible=True).first()
        if item:
            item.disponible = False
            item.trabajador_id = trabajador.id
            db.session.add(item)

    db.session.commit()

    return jsonify({"success": True, "message": "EPPs actualizados correctamente"})

@app.route("/api/trabajador/<int:trabajador_id>/epps", methods=["GET"])
def epps_trabajador(trabajador_id):
    trabajador = Trabajador.query.get(trabajador_id)
    if not trabajador:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404

    # Todos los EPPs existentes
    todos = EPP.query.all()

    # IDs de los EPPs que realmente tiene asignados este trabajador
    asignados = {item.epp_id for item in trabajador.epps_items}

    data = []
    for epp in todos:
        data.append({
            "id": epp.id,
            "nombre": epp.nombre,
            "tipo": epp.tipo,          # 👈 agregado para que el frontend pueda mostrarlo
            "asignado": epp.id in asignados
        })

    return jsonify(data)


# ----------------- SERVIR IMAGENES -----------------
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ----------------- INICIALIZACION -----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # Crear compañía de ejemplo si no existe
        renault = Compania.query.filter_by(nombre="Renault").first()
        if not renault:
            renault = Compania(nombre="Renault")
            db.session.add(renault)
            db.session.commit()
        
        # Crear jefe admin si no existe
        admin = Jefe.query.filter_by(nombre="admin").first()
        if not admin:
            admin = Jefe(nombre="admin", contrasena="admin", compania_id=renault.id)
            db.session.add(admin)
            db.session.commit()

    app.run(debug=True, port=5000)

