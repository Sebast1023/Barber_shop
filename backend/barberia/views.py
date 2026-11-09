from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Servicio, Barbero
from .serializers import ServicioSerializer, BarberoSerializer
from rest_framework import status
from .serializers import CitaSerializer
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from .models import Usuario, Cliente

@api_view(['GET'])
def listar_servicios(request):
    servicios = Servicio.objects.all()
    serializer = ServicioSerializer(servicios, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def listar_barberos(request):
    barberos = Barbero.objects.all()
    serializer = BarberoSerializer(barberos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def crear_cita(request):
    serializer = CitaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"mensaje": "Cita agendada exitosamente"}, status=status.HTTP_201_CREATED)
    # Si hay un error (ej. fecha en el pasado, hora inválida), Django devuelve los detalles
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def registro_cliente(request):
    data = request.data
    try:
        # 1. Guardar en la Base de Datos (Si algo falla aquí, no se guarda nada)
        with transaction.atomic():
            nuevo_usuario = Usuario.objects.create(
                correo=data['correo'],
                contrasena=data['contrasena'],
                rol='CLIENTE'
            )
            
            nuevo_cliente = Cliente.objects.create(
                nombre=data['nombre'],
                cedula=data['cedula'],
                telefono=data['telefono'],
                correo=data['correo'],
                usuario=nuevo_usuario
            )

        # 2. Intentar enviar el correo por separado
        # 2. Intentar enviar el correo por separado
        try:
            send_mail(
                subject='¡Bienvenido a BarberShop The Gentleman\'s!',
                message=f'Hola {nuevo_cliente.nombre},\n\nTu cuenta ha sido creada con éxito. Ya puedes iniciar sesión y agendar tus citas.',
                from_email=settings.DEFAULT_FROM_EMAIL,  
                recipient_list=[nuevo_cliente.correo],
                fail_silently=False,
            )
        except Exception as error_correo:
            # Si el correo falla, lo imprimimos en la terminal para depurar, pero no rompemos el proceso
            print(f"La cuenta se creó, pero el correo falló: {error_correo}")
        
        # 3. Responder éxito al frontend siempre que la BD haya guardado bien
        return Response({"mensaje": "Registro exitoso"}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_cliente(request):
    data = request.data
    try:
        # Buscar al usuario por correo y contraseña
        usuario = Usuario.objects.get(correo=data['correo'], contrasena=data['contrasena'])
        
        if usuario.rol == 'CLIENTE':
            cliente = Cliente.objects.get(usuario=usuario)
            return Response({
                "mensaje": "Login exitoso",
                "id_cliente": cliente.id_cliente,
                "nombre": cliente.nombre
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Módulo exclusivo para clientes."}, status=status.HTTP_403_FORBIDDEN)
            
    except Usuario.DoesNotExist:
        return Response({"error": "Correo o contraseña incorrectos."}, status=status.HTTP_401_UNAUTHORIZED)