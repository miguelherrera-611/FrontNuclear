from flask import Flask, request, jsonify
from flask_cors import CORS
import stripe
import json
from urllib.parse import quote
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@app.route('/crear-sesion-pago', methods=['POST'])
def crear_sesion_pago():
    data = request.json
    carrito = data.get('carrito', [])

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

        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
