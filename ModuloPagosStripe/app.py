from flask import Flask, request, jsonify
from flask_cors import CORS
import stripe
import json
from urllib.parse import quote
from dotenv import load_dotenv
import os
import requests

load_dotenv()
app = Flask(__name__)
CORS(app)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@app.route('/crear-sesion-pago', methods=['POST'])
def crear_sesion_pago():
    data = request.json
    carrito = data.get('carrito', [])
    correo_usuario = data.get('correo_usuario', None)

    if not carrito:
        return jsonify({'error': 'El carrito está vacío'}), 400

    try:
        # Preparar los productos para Stripe
        line_items = []
        for item in carrito:
            line_items.append({
                'price_data': {
                    'currency': 'cop',
                    'unit_amount': int(item['precio'])*100,  
                    'product_data': {
                        'name': item['nombre']
                    }
                },
                'quantity': item.get('cantidad', 1)
            })

        # Codificar carrito como string JSON para pasarlo en la URL
        carrito_json = json.dumps(carrito)
        carrito_codificado = quote(carrito_json)

        # Reemplaza esta URL con la de tu frontend real si es distinto
        success_url = f'http://localhost:5500/success.html?carrito={carrito_codificado}'

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url='http://localhost:5500/cancel.html',
        )

        if correo_usuario :
            mensaje = f"Pago exitoso por {sum(item['precio'] * item.get('cantidad', 1) for item in carrito)} COP"
            notificar_pago_exitoso(correo_usuario, mensaje)

        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def notificar_pago_exitoso(destinatario, mensaje):
    url = 'http://localhost:8000/notificar'  # Cambia esto si usas Docker u otra IP
    data = {
        "tipo": "pago",
        "mensaje": mensaje,
        "destinatario": destinatario
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("Notificación enviada con éxito")
    except requests.exceptions.RequestException as e:
        print(f"Error al enviar la notificación: {e}")

if __name__ == '__main__':
    app.run(port=5000)
