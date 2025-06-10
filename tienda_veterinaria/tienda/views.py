import requests
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Producto, Carrito, CarritoProducto
from .serializers import ProductoSerializer, CarritoSerializer, CarritoProductoSerializer
from .utils import URL_PAGO

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

    def create(self, request, *args, **kwargs):
        """Permitir crear un carrito vacío"""
        carrito = Carrito.objects.create()
        return Response({"id": carrito.id}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generar_pago(self, request, pk=None):
        """Enviar el carrito al módulo de pagos con el valor total"""
        try:
            carrito = Carrito.objects.get(pk=pk)
            productos = CarritoProducto.objects.filter(carrito=carrito)

            # Calcular el valor total de la compra
            total = sum(p.producto.precio * p.cantidad for p in productos)

            # Datos a enviar al módulo de pagos
            data = {
                "carrito_id": carrito.id,
                "total": total,
                "productos": [{"nombre": p.producto.nombre, "cantidad": p.cantidad} for p in productos]
            }

            # Enviar solicitud al módulo de pagos
            response = requests.post(URL_PAGO, json=data)

            if response.status_code == 200:
                carrito.link_pago = f"{URL_PAGO}?carrito_id={carrito.id}"
                carrito.save()
                return Response({"link_pago": carrito.link_pago, "estado": response.json()}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Error al conectar con el módulo de pagos"}, status=response.status_code)

        except Carrito.DoesNotExist:
            return Response({"error": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)

class CarritoProductoViewSet(viewsets.ModelViewSet):
    queryset = CarritoProducto.objects.all()
    serializer_class = CarritoProductoSerializer

    def create(self, request, *args, **kwargs):
        """Validar stock antes de agregar un producto al carrito"""
        carrito_id = request.data.get('carrito')
        producto_id = request.data.get('producto')
        cantidad = request.data.get('cantidad', 1)

        try:
            carrito = Carrito.objects.get(id=carrito_id)
            producto = Producto.objects.get(id=producto_id)

            # Validar si hay suficiente stock
            if producto.stock < cantidad:
                return Response({"error": "Stock insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

            carrito_producto, created = CarritoProducto.objects.get_or_create(carrito=carrito, producto=producto)
            carrito_producto.cantidad = cantidad
            carrito_producto.save()

            return Response(CarritoProductoSerializer(carrito_producto).data, status=status.HTTP_201_CREATED)

        except Producto.DoesNotExist:
            return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Carrito.DoesNotExist:
            return Response({"error": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)
