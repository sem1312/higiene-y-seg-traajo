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
    nombre = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)

    trabajadores = db.relationship("Trabajador", backref="jefe", lazy=True)

class Trabajador(db.Model):
    __tablename__ = "trabajador"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
   

    jefe_id = db.Column(db.Integer, db.ForeignKey("jefe.id"), nullable=False)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)

    epps_items = db.relationship("EPPItem", backref="trabajador", lazy=True)

class EPP(db.Model):
    __tablename__ = "epp"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    compania_id = db.Column(db.Integer, db.ForeignKey("compania.id"), nullable=False)

    fecha_compra = db.Column(db.Date, nullable=False, default=date.today)
    fecha_vencimiento = db.Column(db.Date, nullable=True)

    imagen_url = db.Column(db.String(255), nullable=True)

    items = db.relationship("EPPItem", backref="epp", lazy=True)

class EPPItem(db.Model):
    __tablename__ = "epp_item"
    id = db.Column(db.Integer, primary_key=True)
    epp_id = db.Column(db.Integer, db.ForeignKey("epp.id"), nullable=False)

    trabajador_id = db.Column(db.Integer, db.ForeignKey("trabajador.id"), nullable=True)
    disponible = db.Column(db.Boolean, default=True)
    fecha_compra = db.Column(db.Date, nullable=False, default=date.today)
    fecha_vencimiento = db.Column(db.Date, nullable=True)
