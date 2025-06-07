def generar_link_pago(carrito_id):
    url_base = "http://localhost:5000/crear-sesion-pago"
    return f"{url_base}?carrito_id={carrito_id}"

