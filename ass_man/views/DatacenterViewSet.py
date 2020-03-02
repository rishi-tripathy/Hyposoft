from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models.fields import IntegerField
from django.db.models.functions import Concat, Substr, Cast
from django.db.models.deletion import ProtectedError
from django.db.models import CharField
from django.core.exceptions import ObjectDoesNotExist
# API
from rest_framework import viewsets
from ass_man.serializers.datacenter_serializers import DatacenterSerializer
from ass_man.serializers.rack_serializers import RackOfAssetSerializer

# Auth
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
# Project
from ass_man.models import Model, Asset, Rack, Datacenter, Network_Port, Power_Port, PDU
from rest_framework.filters import OrderingFilter
from django_filters import rest_framework as djfiltBackend

JSON_TRUE = 'true'
ADMIN_ACTIONS = {'create', 'update', 'partial_update', 'destroy'}
GET = 'GET'
POST = 'POST'
DELETE = 'DELETE'
PUT = 'PUT'


class DatacenterViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ADMIN_ACTIONS:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    queryset = Datacenter.objects.all()

    ordering = ['name']

    def get_serializer_class(self):
        serializer_class = DatacenterSerializer
        return serializer_class

    # Override superfunctions

    def update(self, request, *args, **kwargs):
        resp = super().update(request, *args, **kwargs)
        if resp.status_code == 200:
            for rack in self.get_object().rack_set.all():

                if len(rack.rack_number) < 3:
                    root_name = 'hpdu-{}-{}'.format(rack.datacenter.abbreviation,
                                                    rack.rack_number[0] + "0" +
                                                    rack.rack_number[1])
                else:
                    root_name = 'hpdu-{}-{}'.format(rack.datacenter.abbreviation,
                                                    rack.rack_number)

                rack.pdu_l.name = root_name + 'L'
                rack.pdu_r.name = root_name + 'R'
                rack.pdu_l.save()
                rack.pdu_r.save()
        return resp

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({
                'Error': 'Cannot delete this datacenter as it contains racks.'
            }, status=status.HTTP_400_BAD_REQUEST)

    # Custom Endpoints

    # This is used for asset creation, not for displaying racks (should use Rack filter endpoint)
    @action(detail=True, methods=[GET])
    def racks(self, request, *args, **kwargs):
        matches = self.get_object().rack_set  # Rack.objects.filter(datacenter=self.get_object())
        rs = RackOfAssetSerializer(matches, many=True, context={'request': request})
        return Response(rs.data)
