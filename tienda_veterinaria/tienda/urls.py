from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, CarritoViewSet, CarritoProductoViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'carritos', CarritoViewSet)
router.register(r'carrito-productos', CarritoProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('carritos/<int:pk>/generar-pago/', CarritoViewSet.as_view({'post': 'generar_pago'}), name='generar_pago'),
]

