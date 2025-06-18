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

    @action(detail=True, methods=['post'])
    def generar_pago(self, request, pk=None):
        """Genera un link de pago usando el módulo de pagos"""
        try:
            carrito = Carrito.objects.get(pk=pk)
            productos = CarritoProducto.objects.filter(carrito=carrito)

            if not productos.exists():
                return Response({"error": "El carrito está vacío"}, status=status.HTTP_400_BAD_REQUEST)

            # Preparar los datos del carrito para el módulo de pagos
            carrito_data = []
            for producto_carrito in productos:
                carrito_data.append({
                    'nombre': producto_carrito.producto.nombre,
                    'precio': float(producto_carrito.producto.precio)*100,
                    'cantidad': producto_carrito.cantidad
                })

            # Datos para enviar al módulo de pagos
            payload = {
                'carrito': carrito_data,
                'correo_usuario': ""
            }

            # URL del módulo de pagos
            URL_PAGO

            # Hacer la petición al módulo de pagos
            response = requests.post(
                URL_PAGO,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                link_pago = data.get('url')
                
                # Guardar el link en el carrito
                carrito.link_pago = link_pago
                carrito.save()

                return Response({
                    "link_pago": link_pago,
                    "mensaje": "Link de pago generado exitosamente"
                }, status=status.HTTP_200_OK)
            else:
                error_data = response.json() if response.content else {}
                return Response({
                    "error": "Error al generar el pago",
                    "detalle": error_data.get('error', 'Error desconocido')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Carrito.DoesNotExist:
            return Response({"error": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Error de conexión con el módulo de pagos",
                "detalle": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({
                "error": "Error interno del servidor",
                "detalle": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
