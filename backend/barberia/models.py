from django.db import models

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    correo = models.CharField(max_length=200, unique=True)
    contrasena = models.CharField(max_length=200)
    rol = models.CharField(max_length=80, default='CLIENTE')
    fecha_registro = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'usuarios'

class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=20)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    fecha_registro = models.DateField(auto_now_add=True)
    correo = models.CharField(max_length=200, unique=True)
    # Relación 1 a 1 con Usuario
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, db_column='id_usuario')

    class Meta:
        db_table = 'clientes'

class Barbero(models.Model):
    id_barbero = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=20)
    telefono = models.CharField(max_length=20)
    experiencia = models.CharField(max_length=50, null=True, blank=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, db_column='id_usuario')

    class Meta:
        db_table = 'barberos'

class Servicio(models.Model):
    id_servicio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.CharField(max_length=200, null=True, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'servicios'

class Cita(models.Model):
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('ATENDIDA', 'Atendida'),
        ('CANCELADA', 'Cancelada'),
        ('NO ASISTIO', 'No Asistió'),
    ]

    id_cita = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=30, choices=ESTADOS, default='PENDIENTE')
    hora_inicio = models.IntegerField()
    fecha = models.DateField()
    
    # Claves foráneas (Django añade automáticamente el sufijo _id, por lo que usamos db_column para respetar tu SQL)
    cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT, db_column='id_cliente')
    barbero = models.ForeignKey(Barbero, on_delete=models.RESTRICT, db_column='id_barbero')
    servicio = models.ForeignKey(Servicio, on_delete=models.RESTRICT, db_column='id_servicio')
    # Recepcionista lo dejamos como entero simple o lo omites si el frontend de clientes no lo usa directamente
    id_recepcionista = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'citas'