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
from .models import Cita
from .models import Cliente

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


@api_view(['GET'])
def listar_citas_cliente(request, cliente_id):
    try:
        # Filtramos las citas del cliente y las ordenamos por fecha (las más recientes primero)
        citas = Cita.objects.filter(cliente_id=cliente_id).order_by('-fecha', '-hora_inicio')
        
        datos_citas = []
        for cita in citas:
            datos_citas.append({
                "id_cita": cita.pk, # .pk obtiene el ID sin importar cómo se llame la columna
                "fecha": cita.fecha,
                "hora_inicio": f"{cita.hora_inicio}:00", # Formateamos la hora visualmente
                "estado": cita.estado,
                "servicio": cita.servicio.nombre,
                "barbero": cita.barbero.nombre,
                "precio": cita.servicio.precio
            })
            
        return Response(datos_citas, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def cancelar_cita(request, cita_id):
    try:
        cita = Cita.objects.get(pk=cita_id)
        
        # Validamos que solo se puedan cancelar citas que estén pendientes
        if cita.estado == 'PENDIENTE':
            cita.estado = 'CANCELADA'
            cita.save()
            return Response({"mensaje": "Cita cancelada con éxito"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": f"No se puede cancelar una cita en estado {cita.estado}"}, status=status.HTTP_400_BAD_REQUEST)
            
    except Cita.DoesNotExist:
        return Response({"error": "La cita no existe."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def obtener_perfil(request, cliente_id):
    try:
        cliente = Cliente.objects.get(pk=cliente_id)
        
        # Buscamos la próxima cita pendiente (la más cercana en fecha)
        cita_proxima = Cita.objects.filter(cliente_id=cliente_id, estado='PENDIENTE').order_by('fecha', 'hora_inicio').first()
        
        datos_cita = None
        if cita_proxima:
            datos_cita = {
                "fecha": cita_proxima.fecha,
                "hora": f"{cita_proxima.hora_inicio}:00",
                "servicio": cita_proxima.servicio.nombre,
                "barbero": cita_proxima.barbero.nombre
            }

        return Response({
            "nombre": cliente.nombre,
            "correo": cliente.correo,
            "telefono": cliente.telefono,
            "cedula": cliente.cedula,
            "proxima_cita": datos_cita
        }, status=status.HTTP_200_OK)
        
    except Cliente.DoesNotExist:
        return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
def actualizar_perfil(request, cliente_id):
    try:
        cliente = Cliente.objects.get(pk=cliente_id)
        
        # Leemos el nuevo teléfono desde el frontend
        nuevo_telefono = request.data.get('telefono')
        
        if nuevo_telefono:
            cliente.telefono = nuevo_telefono
            cliente.save()
            return Response({"mensaje": "Teléfono actualizado exitosamente"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No se envió un teléfono válido."}, status=status.HTTP_400_BAD_REQUEST)
            
    except Cliente.DoesNotExist:
        return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)