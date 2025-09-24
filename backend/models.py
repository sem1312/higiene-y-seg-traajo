from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class Compania(db.Model):
    __tablename__ = "compania"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)

    jefes = db.relationship("Jefe", backref="compania", lazy=True)
    trabajadores = db.relationship("Trabajador", backref="compania", lazy=True)
    epps = db.relationship("EPP", backref="compania", lazy=True)

class Jefe(db.Model):
    __tablename__ = "jefe"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    contrasena = db.Column(db.String(100), nullable=False)
    nombre_completo = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    dni = db.Column(db.String(20), nullable=True)
    cargo = db.Column(db.String(50), nullable=True)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)
    foto_url = db.Column(db.String(200), nullable=True)
    
    trabajadores = db.relationship("Trabajador", backref="jefe", lazy=True)
    
class Trabajador(db.Model):
    __tablename__ = "trabajador"
    id = db.Column(db.Integer, primary_key=True)

    # Datos personales
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    direccion = db.Column(db.String(150), nullable=True)
    dni = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=True)
    legajo = db.Column(db.String(20), nullable=True)

    jefe_id = db.Column(db.Integer, db.ForeignKey("jefe.id"), nullable=False)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)

    # El backref 'epps_items' se crea automáticamente desde EPPItem.
    # NO definas la relación aquí para evitar el conflicto.
    
class EPP(db.Model):
    __tablename__ = "epp"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(30), nullable=False)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)

    posee_certificacion = db.Column(db.Boolean, default=False, nullable=False)
    marca = db.Column(db.String(100), nullable=True)

    fecha_fabricacion = db.Column(db.Date, nullable=False)
    fecha_compra = db.Column(db.Date, nullable=True)

    vida_util_meses = db.Column(db.Integer, nullable=True)
    fecha_caducidad_fabricante = db.Column(db.Date, nullable=True)

    fecha_caducidad_real = db.Column(db.Date, nullable=False)
    stock = db.Column(db.Integer, default=1, nullable=False)
    imagen_url = db.Column(db.String(255), nullable=True)
    
    # Define la relación en el lado "uno" de la relación
    # El backref 'epp_items' se crea automáticamente en EPPItem
    # items = db.relationship("EPPItem", backref="epp", lazy=True)


class EPPItem(db.Model):
    __tablename__ = "epp_item"
    id = db.Column(db.Integer, primary_key=True)
    epp_id = db.Column(db.Integer, db.ForeignKey("epp.id"), nullable=False)
    trabajador_id = db.Column(db.Integer, db.ForeignKey("trabajador.id"), nullable=True)
    disponible = db.Column(db.Boolean, default=True)
    fecha_compra = db.Column(db.Date, nullable=False, default=date.today)
    fecha_vencimiento = db.Column(db.Date, nullable=True)
    cantidad = db.Column(db.Integer, default=1) 
    fecha_entrega = db.Column(db.Date, default=date.today)
    
    # Esta es la definición correcta para ambas relaciones.
    # El backref 'epp_items' crea la relación en EPP.
    epp = db.relationship('EPP', backref=db.backref('epp_items', lazy=True))
    
    # El backref 'epps_items' crea la relación en Trabajador.
    trabajador = db.relationship('Trabajador', backref=db.backref('epps_items', lazy=True))
