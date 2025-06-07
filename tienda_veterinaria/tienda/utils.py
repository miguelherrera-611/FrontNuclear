import requests
from serializers import PedidoSerializer
from models import Pedido
from views import viewsets
from requests import Response

def obtener_usuario(usuario_id):
    url = f"http://microservicio_usuarios/api/usuarios/{usuario_id}/"
    response = requests.get(url)
    return response.json() if response.status_code == 200 else None

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def create(self, request, *args, **kwargs):
        cliente = obtener_usuario(request.data['cliente_id'])
        if not cliente:
            return Response({"error": "Cliente no encontrado"}, status=400)
        return super().create(request, *args, **kwargs)
