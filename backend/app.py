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
            "apellido": t.apellido,
            "dni": t.dni,
            "telefono": t.telefono,
            "email": t.email,
            "direccion": t.direccion,
            "compania_id": t.compania_id,
            "legajo": t.legajo,
            "epps_asignados": [
                {
                    "id": e.epp.id,
                    "tipo": e.epp.tipo,
                    "nombre": e.epp.nombre,
                    "fecha_vencimiento": e.fecha_vencimiento.isoformat() if e.fecha_vencimiento else None,
                    "imagen_url": e.epp.imagen_url,
                    "marca": e.epp.marca,
                    "posee_certificacion": e.epp.posee_certificacion
                } for e in t.epps_items if e.trabajador_id == t.id
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

    epps = EPP.query.filter_by(compania_id=compania_id).all()
    lista = []
    for e in epps:
        lista.append({
            "id": e.id,
            "nombre": e.nombre,
            "tipo": e.tipo,
            "fecha_fabricacion": e.fecha_fabricacion.isoformat() if e.fecha_fabricacion else None,
            "vida_util_meses": e.vida_util_meses,
            "fecha_caducidad_fabricante": e.fecha_caducidad_fabricante.isoformat() if e.fecha_caducidad_fabricante else None,
            "fecha_caducidad_real": e.fecha_caducidad_real.isoformat() if e.fecha_caducidad_real else None,
            "imagen_url": e.imagen_url,
            "compania_id": e.compania_id,
            "stock": e.stock,
            "marca": e.marca,
            "posee_certificacion": e.posee_certificacion
        })
    return jsonify(lista)


# --- CREAR EPP ---
@app.route("/api/epp", methods=["POST"])
def crear_epp():
    tipo = request.form.get("tipo")
    nombre = request.form.get("nombre")
    compania_id = request.form.get("compania_id")
    stock = request.form.get("stock", 1)

    # Validaciones obligatorias
    if not tipo:
        return jsonify({"success": False, "message": "El campo 'tipo' es obligatorio"}), 400
    if not nombre:
        return jsonify({"success": False, "message": "El campo 'nombre' es obligatorio"}), 400
    if not compania_id:
        return jsonify({"success": False, "message": "El campo 'compania_id' es obligatorio"}), 400

    # ✅ campos nuevos
    posee_certificacion = str(request.form.get("posee_certificacion", "false")).lower() in ("true", "1", "yes")
    marca = request.form.get("marca")

    fecha_fabricacion_str = request.form.get("fecha_fabricacion")
    
    fecha_compra_str = request.form.get("fecha_compra")
    fecha_compra = None
    if fecha_compra_str:
        try:
            fecha_compra = datetime.strptime(fecha_compra_str, "%Y-%m-%d").date()
        except ValueError:
            fecha_compra = None
        
    vida_util_meses = request.form.get("vida_util_meses")
    fecha_caducidad_fabricante_str = request.form.get("fecha_caducidad_fabricante")

    try:
        compania_id = int(compania_id)
        stock = max(1, int(stock))
        vida_util_meses = int(vida_util_meses) if vida_util_meses else None
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Datos inválidos"}), 400

    # Fecha de fabricación obligatoria
    if not fecha_fabricacion_str:
        return jsonify({"success": False, "message": "El campo 'fecha_fabricacion' es obligatorio"}), 400

    try:
        fecha_fabricacion = datetime.strptime(fecha_fabricacion_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Fecha de fabricación inválida"}), 400

    # Fecha de caducidad fabricante opcional
    fecha_caducidad_fabricante = None
    if fecha_caducidad_fabricante_str:
        try:
            fecha_caducidad_fabricante = datetime.strptime(fecha_caducidad_fabricante_str, "%Y-%m-%d").date()
        except ValueError:
            try:
                fecha_caducidad_fabricante = datetime.strptime(fecha_caducidad_fabricante_str, "%d/%m/%Y").date()
            except ValueError:
                fecha_caducidad_fabricante = None  # ignorar si sigue mal

    # Calcular caducidad real
    from dateutil.relativedelta import relativedelta
    fecha_caducidad_real = fecha_caducidad_fabricante or (fecha_fabricacion + relativedelta(months=vida_util_meses) if vida_util_meses else None)
    if not fecha_caducidad_real:
        # Si no hay nada, poner por defecto 1 año desde fabricación
        fecha_caducidad_real = fecha_fabricacion + relativedelta(years=1)

    # Imagen
    imagen_url = None
    if "imagen" in request.files:
        file = request.files["imagen"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            imagen_url = f"uploads/{filename}"

    # Crear objeto EPP
    epp = EPP(
        tipo=tipo,
        nombre=nombre,
        compania_id=compania_id,
        stock=stock,
        fecha_fabricacion=fecha_fabricacion,
        fecha_compra=fecha_compra,  # <--- agregado
        vida_util_meses=vida_util_meses,
        fecha_caducidad_fabricante=fecha_caducidad_fabricante,
        fecha_caducidad_real=fecha_caducidad_real,
        imagen_url=imagen_url,
        posee_certificacion=posee_certificacion,
        marca=marca
    )


    db.session.add(epp)
    db.session.commit()

    return jsonify({
        "success": True,
        "id": epp.id,
        "nombre": epp.nombre,
        "tipo": epp.tipo,
        "stock": epp.stock,
        "fecha_fabricacion": epp.fecha_fabricacion.isoformat(),
        "fecha_compra": epp.fecha_compra.isoformat() if epp.fecha_compra else None,
        "vida_util_meses": epp.vida_util_meses,
        "fecha_caducidad_fabricante": epp.fecha_caducidad_fabricante.isoformat() if epp.fecha_caducidad_fabricante else None,
        "fecha_caducidad_real": epp.fecha_caducidad_real.isoformat(),
        "imagen_url": epp.imagen_url,
        "compania_id": epp.compania_id,
        "posee_certificacion": epp.posee_certificacion,
        "marca": epp.marca
    })

# --- ELIMINAR EPP ---
@app.route("/api/epp/<int:id>", methods=["DELETE"])
def eliminar_epp(id):
    epp = db.session.get(EPP, id)
    if not epp:
        return jsonify({"success": False, "message": "EPP no encontrado"}), 404
    db.session.delete(epp)
    db.session.commit()
    return jsonify({"success": True, "message": "EPP eliminado"})

# --- EDITAR EPP --- 
@app.route("/api/epp/<int:id>", methods=["PUT"])
def editar_epp(id):
    epp = db.session.get(EPP, id)
    if not epp:
        return jsonify({"success": False, "message": "EPP no encontrado"}), 404

    tipo = request.form.get("tipo")
    nombre = request.form.get("nombre")
    marca = request.form.get("marca")
    posee_certificacion = str(request.form.get("posee_certificacion", "false")).lower() in ("true", "1", "yes")
    fecha_fabricacion_str = request.form.get("fecha_fabricacion")
    fecha_caducidad_fabricante_str = request.form.get("fecha_caducidad_fabricante")
    vida_util_meses = request.form.get("vida_util_meses")
    stock = request.form.get("stock")
    fecha_compra_str = request.form.get("fecha_compra")

    # Actualizar campos simples
    if tipo: epp.tipo = tipo
    if nombre: epp.nombre = nombre
    if marca: epp.marca = marca
    epp.posee_certificacion = posee_certificacion
    if stock: epp.stock = int(stock)

    # Fechas
    if fecha_fabricacion_str:
        epp.fecha_fabricacion = datetime.strptime(fecha_fabricacion_str, "%Y-%m-%d").date()

    # Fecha de caducidad del fabricante: solo si viene válida
    if fecha_caducidad_fabricante_str and fecha_caducidad_fabricante_str.lower() != "null":
        try:
            epp.fecha_caducidad_fabricante = datetime.strptime(fecha_caducidad_fabricante_str, "%Y-%m-%d").date()
        except ValueError:
            epp.fecha_caducidad_fabricante = None
    else:
        epp.fecha_caducidad_fabricante = None

    # Fecha de compra
    if fecha_compra_str and fecha_compra_str.lower() != "null":
        try:
            epp.fecha_compra = datetime.strptime(fecha_compra_str, "%Y-%m-%d").date()
        except ValueError:
            epp.fecha_compra = None
    else:
        epp.fecha_compra = None

    # Vida útil
    if vida_util_meses:
        try:
            epp.vida_util_meses = int(vida_util_meses)
        except ValueError:
            epp.vida_util_meses = None

    # Recalcular fecha_caducidad_real
    from dateutil.relativedelta import relativedelta
    epp.fecha_caducidad_real = epp.fecha_caducidad_fabricante or (
        epp.fecha_fabricacion + relativedelta(months=epp.vida_util_meses) if epp.fecha_fabricacion and epp.vida_util_meses else None
    )
    if not epp.fecha_caducidad_real and epp.fecha_fabricacion:
        epp.fecha_caducidad_real = epp.fecha_fabricacion + relativedelta(years=1)

    # Imagen
    if "imagen" in request.files:
        file = request.files["imagen"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            epp.imagen_url = f"uploads/{filename}"

    db.session.commit()

    return jsonify({
        "success": True,
        "id": epp.id,
        "nombre": epp.nombre,
        "tipo": epp.tipo,
        "stock": epp.stock,
        "fecha_fabricacion": epp.fecha_fabricacion.isoformat() if epp.fecha_fabricacion else None,
        "vida_util_meses": epp.vida_util_meses,
        "fecha_caducidad_fabricante": epp.fecha_caducidad_fabricante.isoformat() if epp.fecha_caducidad_fabricante else None,
        "fecha_caducidad_real": epp.fecha_caducidad_real.isoformat() if epp.fecha_caducidad_real else None,
        "fecha_compra": epp.fecha_compra.isoformat() if epp.fecha_compra else None,
        "imagen_url": epp.imagen_url,
        "marca": epp.marca,
        "posee_certificacion": epp.posee_certificacion
    })

@app.route("/api/epps_trabajador", methods=["POST"])
def actualizar_epps_trabajador_unificado():
    """
    Actualiza los EPPs de un trabajador:
    - libera EPPs que ya no están
    - asigna nuevos EPPs disponibles
    - actualiza datos como fecha de entrega, cantidad, etc.
    """
    data = request.get_json()
    print("Datos recibidos:", data)
    trabajador_id = data.get("trabajador_id")
    epps_a_asignar = data.get("epps", [])  # lista de {epp_id, cantidad, fecha_entrega, fecha_vencimiento}

    trabajador = db.session.get(Trabajador, trabajador_id)
    if not trabajador:
        return jsonify({"success": False, "message": "Trabajador no encontrado"}), 404

    # IDs de EPPs que el trabajador debería tener
    nuevos_ids = {e["epp_id"] for e in epps_a_asignar}

    # Paso 1: Liberar EPPItems que ya no deberían estar asignados
    items_a_liberar = [item for item in trabajador.epps_items if item.epp_id not in nuevos_ids]
    for item in items_a_liberar:
        item.trabajador_id = None
        item.fecha_vencimiento = None
        item.cantidad = 1
        item.fecha_entrega = None

    # Paso 2: Asignar o actualizar EPPItems
    for epp_data in epps_a_asignar:
        epp_id = epp_data["epp_id"]
        cantidad = epp_data.get("cantidad", 1)
        fecha_entrega_str = epp_data.get("fecha_entrega")
        fecha_vencimiento_str = epp_data.get("fecha_vencimiento")

        # Buscar un item disponible (no asignado) para este EPP
        item = EPPItem.query.filter_by(epp_id=epp_id, trabajador_id=None).first()

        if not item:
            # Crear un item nuevo si hay stock
            epp = db.session.get(EPP, epp_id)
            if epp and epp.stock > 0:
                item = EPPItem(
                    epp_id=epp_id,
                    trabajador_id=trabajador.id,
                    cantidad=cantidad,
                    fecha_entrega=datetime.strptime(fecha_entrega_str, "%Y-%m-%d").date() if fecha_entrega_str else None,
                    fecha_vencimiento=datetime.strptime(fecha_vencimiento_str, "%Y-%m-%d").date() if fecha_vencimiento_str else None
                )
                db.session.add(item)
                epp.stock -= 1

        if item:
            # Actualizar los datos del EPPItem
            item.trabajador_id = trabajador.id
            item.cantidad = cantidad

            if fecha_entrega_str:
                try:
                    item.fecha_entrega = datetime.strptime(fecha_entrega_str, "%Y-%m-%d").date()
                except ValueError:
                    item.fecha_entrega = None

            if fecha_vencimiento_str:
                try:
                    item.fecha_vencimiento = datetime.strptime(fecha_vencimiento_str, "%Y-%m-%d").date()
                except ValueError:
                    item.fecha_vencimiento = None

    db.session.commit()
    db.session.refresh(trabajador)

    # Devolver trabajador con EPPs actualizados para reflejar cambios en el frontend
    return jsonify({
        "success": True,
        "trabajador": {
            "id": trabajador.id,
            "nombre": trabajador.nombre,
            "apellido": trabajador.apellido,
            "epps_asignados": [
                {
                    "id": item.epp.id,
                    "nombre": item.epp.nombre,
                    "tipo": item.epp.tipo,
                    "fecha_vencimiento": item.fecha_vencimiento.isoformat() if item.fecha_vencimiento else None,
                    "fecha_entrega": item.fecha_entrega.isoformat() if item.fecha_entrega else None,
                    "cantidad": item.cantidad,
                    "marca": item.epp.marca,
                    "posee_certificacion": item.epp.posee_certificacion
                }
                for item in trabajador.epps_items if item.trabajador_id == trabajador.id
            ]
        }
    })



# --- REPONER STOCK --- 
@app.route("/api/reponer_stock/<int:epp_id>", methods=["POST"])
def reponer_stock(epp_id):
    data = request.get_json()
    cantidad = data.get("cantidad")

    if cantidad is None or cantidad <= 0:
        return jsonify({"success": False, "message": "Cantidad inválida"}), 400

    epp = db.session.get(EPP, epp_id)
    if not epp:
        return jsonify({"success": False, "message": "EPP no encontrado"}), 404

    # Actualizar stock
    epp.stock += int(cantidad)
    db.session.commit()

    return jsonify({"success": True, "nuevo_stock": epp.stock})


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
