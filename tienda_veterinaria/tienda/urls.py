from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarritoViewSet, CarritoProductoViewSet, ProductoViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'carritos', CarritoViewSet)
router.register(r'carrito-productos', CarritoProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
