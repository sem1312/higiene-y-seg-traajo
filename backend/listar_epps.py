from app import app, db
from models import Trabajador, EPPItem

with app.app_context():
    trabajadores = Trabajador.query.all()
    for t in trabajadores:
        print(f"Trabajador {t.id}: {t.nombre} {t.apellido}")
        if not t.epps_items:
            print("  No tiene EPPs asignados")
        for item in t.epps_items:
            print(f"  EPP ID: {item.epp_id}, Cantidad: {item.cantidad}, "
                  f"Entrega: {item.fecha_entrega}, Vencimiento: {item.fecha_vencimiento}, "
                  f"Asignado a: {item.trabajador_id}")
        print("-" * 50)
