import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from dotenv import load_dotenv
import os
import base64

# Cargar las variables de entorno del archivo .env
load_dotenv()

# Obtener las credenciales desde las variables de entorno
REMITENTE = os.getenv("EMAIL_REMITENTE")
CLAVE_APP = os.getenv("EMAIL_CLAVE_APP")

def enviar_correo(destinatario, asunto, mensaje):

    print(f"Enviando correo a {destinatario} con asunto '{asunto}'")
    msg = MIMEMultipart()
    msg['From'] = REMITENTE
    msg['To'] = destinatario
    msg['Subject'] = asunto
    msg.attach(MIMEText(mensaje, 'plain', 'utf-8'))

    try:
        servidor = smtplib.SMTP('smtp.gmail.com', 587)
        servidor.starttls()
        servidor.login(REMITENTE, CLAVE_APP)
        servidor.sendmail(REMITENTE, destinatario, msg.as_string())
        servidor.quit()
        print("Correo enviado correctamente.")
    except Exception as e:
        print(f"Error al enviar correo: {e}")


def enviar_correo_con_adjunto(destinatario, asunto, mensaje, adjunto_base64=None, nombre_adjunto=None):
    msg = MIMEMultipart()
    msg['From'] = REMITENTE
    msg['To'] = destinatario
    msg['Subject'] = asunto
    msg.attach(MIMEText(mensaje, 'plain', 'utf-8'))

    # ✅ Si hay adjunto, lo agrega
    if adjunto_base64 and nombre_adjunto:
        try:
            pdf_bytes = base64.b64decode(adjunto_base64)
            adjunto = MIMEApplication(pdf_bytes, _subtype="pdf")
            adjunto.add_header('Content-Disposition', 'attachment', filename=nombre_adjunto)
            msg.attach(adjunto)
        except Exception as e:
            print("Error al procesar el adjunto:", e)

    try:
        servidor = smtplib.SMTP('smtp.gmail.com', 587)
        servidor.starttls()
        servidor.login(REMITENTE, CLAVE_APP)
        servidor.sendmail(REMITENTE, destinatario, msg.as_string())
        servidor.quit()
        print("Correo enviado correctamente.")
    except Exception as e:
        print(f"Error al enviar correo: {e}")