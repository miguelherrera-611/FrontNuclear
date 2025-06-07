from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Producto, Carrito, CarritoProducto
from .serializers import ProductoSerializer, CarritoSerializer, CarritoProductoSerializer
from .utils import generar_link_pago

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

    @action(detail=True, methods=['post'])
    def generar_pago(self, request, pk=None):
        try:
            carrito = Carrito.objects.get(pk=pk)
            link_pago = generar_link_pago(carrito.id)
            carrito.link_pago = link_pago
            carrito.save()
            return Response({"link_pago": link_pago}, status=status.HTTP_200_OK)
        except Carrito.DoesNotExist:
            return Response({"error": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)

class CarritoProductoViewSet(viewsets.ModelViewSet):
    queryset = CarritoProducto.objects.all()
    serializer_class = CarritoProductoSerializer
