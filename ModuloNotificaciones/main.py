from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.correo import enviar_correo, enviar_correo_con_adjunto
from flask import Flask, request, jsonify
import base64


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



# Modelo de entrada
class NotificacionAdjunto(BaseModel):
    destinatario: str
    tipo: str
    mensaje: str
    adjunto: str | None = None  # base64
    nombreAdjunto: str | None = "historia.pdf"

@app.post("/notificar/adjunto")
def notificar_adjunto(data: NotificacionAdjunto):
    try:
        if data.adjunto:
            enviar_correo_con_adjunto(data.destinatario, data.tipo, data.mensaje, data.adjunto, data.nombreAdjunto)
        else:
            notificar(data.destinatario, data.tipo, data.mensaje)

        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar notificación: {str(e)}")