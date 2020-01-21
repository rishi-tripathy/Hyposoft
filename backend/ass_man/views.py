from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response

# Create your views here.

# API
from rest_framework import viewsets
from backend.ass_man.serializers import UserSerializer, InstanceShortSerializer, InstanceSerializer, \
    ModelShortSerializer, ModelSerializer,  RackSerializer
# Auth
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
# Project
from backend.ass_man.models import Model, Instance, Rack

ADMIN_ACTIONS = {'create', 'update', 'partial_update', 'destroy'}


# Docs for ModelViewSet: https://www.django-rest-framework.org/api-guide/viewsets/#modelviewset
class UserViewSet(viewsets.ModelViewSet):
    # API endpoint that allows users to be viewed or edited.

    # def get_permissions(self):
    #     # Instantiates and returns the list of permissions that this view requires.
    #     if self.action in ADMIN_ACTIONS:
    #         permission_classes = [IsAdminUser]
    #     else:
    #         permission_classes = [IsAuthenticated]
    #     return [permission() for permission in permission_classes]

    permission_classes = [AllowAny]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class ModelViewSet(viewsets.ModelViewSet):
    # API endpoint that allows groups to be viewed or edited.

    # def get_permissions(self):
    #     # Instantiates and returns the list of permissions that this view requires.
    #     if self.action in ADMIN_ACTIONS:
    #         permission_classes = [IsAdminUser]
    #     else:
    #         permission_classes = [IsAuthenticated]
    #     return [permission() for permission in permission_classes]

    permission_classes = [AllowAny]
    queryset = Model.objects.all()

    def get_serializer_class(self):
        detail = self.request.query_params.get('detail')
        serializer_class = ModelShortSerializer if detail == 'short' else ModelSerializer
        return serializer_class

    # @action(detail=True)
    # def short(self, request, *args, **kwargs):
    #     queryset = Model.objects.all()
    #     serializer_class = ModelShortSerializer(queryset, many=True)
    #     return Response(serializer_class.data)


class InstanceViewSet(viewsets.ModelViewSet):
    # API endpoint that allows groups to be viewed or edited.

    # def get_permissions(self):
    #     # Instantiates and returns the list of permissions that this view requires.
    #     if self.action in ADMIN_ACTIONS:
    #         permission_classes = [IsAdminUser]
    #     else:
    #         permission_classes = [IsAuthenticated]
    #     return [permission() for permission in permission_classes]

    permission_classes = [AllowAny]
    queryset = Instance.objects.all()

    def get_serializer_class(self):
        detail = self.request.query_params.get('detail')
        serializer_class = InstanceShortSerializer if detail=='short' else InstanceSerializer
        return serializer_class


class RackViewSet(viewsets.ModelViewSet):
    # API endpoint that allows groups to be viewed or edited.

    # def get_permissions(self):
    #     # Instantiates and returns the list of permissions that this view requires.
    #     if self.action in ADMIN_ACTIONS:
    #         permission_classes = [IsAdminUser]
    #     else:
    #         permission_classes = [IsAuthenticated]
    #     return [permission() for permission in permission_classes]

    permission_classes = [AllowAny]
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
