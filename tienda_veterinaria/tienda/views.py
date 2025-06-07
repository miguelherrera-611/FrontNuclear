from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Carrito, CarritoProducto, Producto
from .serializers import CarritoSerializer, CarritoProductoSerializer, ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

    def create(self, request, *args, **kwargs):
        carrito = Carrito.objects.create()
        return Response({"id": carrito.id}, status=status.HTTP_201_CREATED)

class CarritoProductoViewSet(viewsets.ModelViewSet):
    queryset = CarritoProducto.objects.all()
    serializer_class = CarritoProductoSerializer

    def create(self, request, *args, **kwargs):
        carrito_id = request.data.get('carrito')
        producto_id = request.data.get('producto')
        cantidad = request.data.get('cantidad', 1)

        carrito = Carrito.objects.get(id=carrito_id)
        producto = Producto.objects.get(id=producto_id)

        carrito_producto, created = CarritoProducto.objects.get_or_create(carrito=carrito, producto=producto)
        carrito_producto.cantidad = cantidad
        carrito_producto.save()

        return Response(CarritoProductoSerializer(carrito_producto).data, status=status.HTTP_201_CREATED)
