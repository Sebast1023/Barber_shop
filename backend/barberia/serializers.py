# barberia/serializers.py
from rest_framework import serializers
from .models import Servicio, Barbero, Cita

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = '__all__'

class BarberoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barbero
        fields = '__all__'

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'