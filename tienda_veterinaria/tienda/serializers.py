from rest_framework import serializers
from .models import Carrito, CarritoProducto, Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'
        
class CarritoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarritoProducto
        fields = '__all__'

class CarritoSerializer(serializers.ModelSerializer):
    productos = CarritoProductoSerializer(many=True, source='carritoproducto_set')

    class Meta:
        model = Carrito
        fields = '__all__'
      
