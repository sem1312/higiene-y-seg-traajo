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
    email = data.get("email")
    contrasena = data.get("contrasena")

    if not email or not contrasena:
        return jsonify({"success": False, "message": "Faltan datos"}), 400

    user = Jefe.query.filter_by(email=email).first()
    if user and user.contrasena == contrasena:
        return jsonify({
            "success": True,
            "message": "Login correcto",
            "jefe_id": user.id,
            "compania_id": user.compania_id
        })
    return jsonify({"success": False, "message": "Email o contraseña incorrectos"}), 401

# ----------------- REGISTRAR CUENTA -----------------
@app.route("/api/registrar_cuenta", methods=["POST"])
def registrar_cuenta():
    data = request.get_json()

    # Datos personales
    nombre_completo = data.get("nombre_completo")
    dni = data.get("dni")
    email = data.get("email")
    telefono = data.get("telefono")

    # Datos de cuenta
    contrasena = data.get("contrasena")

    # Datos profesionales
    compania_nombre = data.get("compania")
    cargo = data.get("cargo")

    if not all([nombre_completo, dni, email, contrasena, compania_nombre]):
        return jsonify({"success": False, "message": "Faltan datos obligatorios"}), 400

    if Jefe.query.filter((Jefe.email == email) | (Jefe.dni == dni)).first():
        return jsonify({"success": False, "message": "Ya existe un usuario con ese email/DNI"}), 400

    # Crear compañía
    compania = Compania(nombre=compania_nombre)
    db.session.add(compania)
    db.session.commit()

    # Crear jefe
    jefe = Jefe(
        contrasena=contrasena,
        nombre_completo=nombre_completo,
        dni=dni,
        email=email,
        telefono=telefono,
        cargo=cargo,
        compania_id=compania.id,
        foto_url=None
    )
    db.session.add(jefe)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Cuenta creada correctamente",
        "jefe_id": jefe.id,
        "compania_id": compania.id
    })

# ----------------- CRUD TRABAJADORES -----------------
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
            "compania_id": t.compania_id,
            "legajo": t.legajo,
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

    # Campos obligatorios
    nombre = data.get("nombre")
    apellido = data.get("apellido")
    dni = data.get("dni")
    jefe_id = data.get("jefe_id")

    if not nombre or not apellido or not dni or not jefe_id:
        return jsonify({"success": False, "message": "Faltan datos obligatorios"}), 400

    jefe = db.session.get(Jefe, jefe_id)
    if not jefe:
        return jsonify({"success": False, "message": "Jefe no encontrado"}), 404

    # Campos opcionales
    telefono = data.get("telefono")
    direccion = data.get("direccion")
    email = data.get("email")
    legajo = data.get("legajo")

    # Crear trabajador usando todos los campos del modelo
    t = Trabajador(
        nombre=nombre,
        apellido=apellido,
        dni=dni,
        telefono=telefono,
        direccion=direccion,
        email=email,
        legajo=legajo,
        jefe_id=jefe.id,
        compania_id=jefe.compania_id
    )

    db.session.add(t)
    db.session.commit()

    # Devolver al frontend todos los campos que necesitas mostrar
    return jsonify({
        "success": True,
        "trabajador": {
            "id": t.id,
            "nombre": t.nombre,
            "apellido": t.apellido,
            "dni": t.dni,
            "telefono": t.telefono,
            "email": t.email,
            "direccion": t.direccion,
            "legajo": t.legajo
        }
    })



@app.route("/api/trabajadores/<int:id>", methods=["DELETE"])
def eliminar_trabajador(id):
    t = db.session.get(Trabajador, id)
    if not t:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"success": True})

# ----------------- EPP -----------------
@app.route("/api/epps", methods=["GET"])
def get_epps():
    compania_id = request.args.get("compania_id")
    if not compania_id:
        return jsonify([])

    try:
        compania_id = int(compania_id)
    except ValueError:
        return jsonify([])

    epps = EPP.query.filter_by(compania_id=compania_id).all()
    lista = []
    for e in epps:
        stock = EPPItem.query.filter_by(epp_id=e.id, disponible=True).count()
        lista.append({
            "id": e.id,
            "nombre": e.nombre,
            "tipo": e.tipo,
            "fecha_de_compra": e.fecha_compra.isoformat() if e.fecha_compra else None,
            "imagen_url": e.imagen_url,
            "compania_id": e.compania_id,
            "stock": stock
        })
    return jsonify(lista)

@app.route("/api/epp", methods=["POST"])
def crear_epp():
    tipo = request.form.get("tipo")
    nombre = request.form.get("nombre")
    compania_id = request.form.get("compania_id")
    stock = request.form.get("stock", 1)

    try:
        compania_id = int(compania_id)
        stock = int(stock)
        if stock < 1:
            stock = 1
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "compania_id o stock inválido"}), 400

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
        "fecha_de_compra": epp.fecha_compra.isoformat() if epp.fecha_compra else None,
        "imagen_url": epp.imagen_url,
        "compania_id": epp.compania_id
    })

# ----------------- ASIGNAR EPP -----------------
@app.route("/api/asignar_epp", methods=["POST"])
def asignar_epp():
    data = request.get_json()
    trabajador_id = data.get("trabajador_id")
    epp_id = data.get("epp_id")
    trabajador = db.session.get(Trabajador, trabajador_id)
    item = EPPItem.query.filter_by(epp_id=epp_id, disponible=True).first()
    if not trabajador or not item:
        return jsonify({"success": False, "message": "Trabajador o EPP no encontrado"}), 404
    item.disponible = False
    item.trabajador_id = trabajador.id
    db.session.commit()
    return jsonify({"success": True, "message": f"EPP asignado a {trabajador.nombre}"})

# --------- ✅ NUEVA RUTA: ACTUALIZAR EPPs DE UN TRABAJADOR -------------
@app.route("/api/actualizar_epps_trabajador", methods=["POST"])
def actualizar_epps_trabajador():
    data = request.get_json()
    trabajador_id = data.get("trabajador_id")
    epp_ids = data.get("epp_ids", [])
    fechas_vencimiento = data.get("fechas_vencimiento", {})

    trabajador = db.session.get(Trabajador, trabajador_id)
    if not trabajador:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404

    # Eliminar EPPItems antiguos
    for item in trabajador.epps_items:
        item.trabajador_id = None
        item.fecha_vencimiento = None

    # Asignar nuevos EPPs
    for epp_id in epp_ids:
        item = EPPItem.query.filter_by(epp_id=epp_id, trabajador_id=None).first()
        if item:
            item.trabajador_id = trabajador.id
            # Convertir la fecha de string a date, o poner None si está vacía
            fecha_str = fechas_vencimiento.get(str(epp_id))
            if fecha_str:
                try:
                    item.fecha_vencimiento = datetime.strptime(fecha_str, "%Y-%m-%d").date()
                except ValueError:
                    item.fecha_vencimiento = None
            else:
                item.fecha_vencimiento = None


    db.session.commit()
    db.session.refresh(trabajador)

    # Devolver el trabajador completo con los campos que el frontend necesita
    return jsonify({
        "success": True,
        "trabajador": {
            "id": trabajador.id,
            "nombre": trabajador.nombre,
            "apellido": trabajador.apellido,
            "dni": trabajador.dni,
            "telefono": trabajador.telefono,
            "email": trabajador.email,
            "direccion": trabajador.direccion,
            "legajo": trabajador.legajo,
            "epps_asignados": [
                {"id": item.epp.id, "nombre": item.epp.nombre, "tipo": item.epp.tipo, "fecha_vencimiento": item.fecha_vencimiento}
                for item in trabajador.epps_items if item.trabajador_id == trabajador.id
            ]
        }
    })





# ----------------- FOTO DE PERFIL -----------------
@app.route("/api/jefe/<int:jefe_id>", methods=["GET"])
def get_jefe(jefe_id):
    jefe = db.session.get(Jefe, jefe_id)
    if not jefe:
        return jsonify({}), 404
    return jsonify({
        "nombre_completo": jefe.nombre_completo,
        "email": jefe.email,
        "telefono": jefe.telefono,
        "cargo": jefe.cargo,
        "foto_url": getattr(jefe, "foto_url", None)
    })

@app.route("/api/jefe/<int:jefe_id>/foto", methods=["POST"])
def subir_foto_jefe(jefe_id):
    jefe = db.session.get(Jefe, jefe_id)
    if not jefe:
        return jsonify({"success": False, "message": "Jefe no encontrado"}), 404
    if "foto" not in request.files:
        return jsonify({"success": False, "message": "No hay archivo"}), 400
    file = request.files["foto"]
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        jefe.foto_url = f"uploads/{filename}"
        db.session.commit()
        return jsonify({"success": True, "foto_url": jefe.foto_url})
    return jsonify({"success": False, "message": "Archivo inválido"}), 400

# ----------------- SERVIR IMAGENES -----------------
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ----------------- INICIALIZACION -----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # Crear compañía y admin si no existen
        compania = Compania.query.filter_by(nombre="EmpresaX").first()
        if not compania:
            compania = Compania(nombre="EmpresaX")
            db.session.add(compania)
            db.session.commit()

        admin = Jefe.query.filter_by(email="admin@example.com").first()
        if not admin:
            admin = Jefe(
                contrasena="admin",
                nombre_completo="Admin",
                dni="00000000",
                email="admin@example.com",
                telefono="",
                cargo="Administrador",
                compania_id=compania.id,
                foto_url=None
            )
            db.session.add(admin)
            db.session.commit()

    app.run(debug=True, port=5000)
