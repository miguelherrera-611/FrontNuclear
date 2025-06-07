from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.correo import enviar_correo

app = FastAPI()

class Notificacion(BaseModel):
    tipo: str  # "pago" o "cita"
    mensaje: str
    destinatario: str  # email o número de WhatsApp

@app.post("/notificar")
def notificar(data: Notificacion):
    print(f"Recibida notificación: {data.tipo}, mensaje: {data.mensaje}, destinatario: {data.destinatario}")
    if not data.destinatario or not data.mensaje:
        raise HTTPException(status_code=400, detail="Destinatario y mensaje son obligatorios")
    try:
        if data.tipo == "pago":
            enviar_correo(data.destinatario, "Pago exitoso", data.mensaje)
        elif data.tipo == "cita":
            enviar_correo(data.destinatario, "Cita confirmada", data.mensaje)
        elif data.tipo == "otros":
            enviar_correo(data.destinatario, "Notificación", data.mensaje)
        elif data.tipo != "pago" and data.tipo != "cita" and data.tipo != "otros":
            enviar_correo(data.destinatario, data.tipo, data.mensaje)
        else:
            raise HTTPException(status_code=400, detail="Tipo no soportado")
        return {"estado": "ok", "detalle": "Notificación enviada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
