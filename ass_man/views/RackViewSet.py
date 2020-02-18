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

from ass_man.serializers.rack_serializers import RackFetchSerializer, RackSerializer

# Auth
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
# Project
from ass_man.models import Model, Asset, Rack, Datacenter, Network_Port, Power_Port, PDU
from rest_framework.filters import OrderingFilter
from django_filters import rest_framework as djfiltBackend
from ass_man.filters import AssetFilter, ModelFilter, RackFilter, AssetFilterByRack
from rest_framework.serializers import ValidationError
import json

JSON_TRUE = 'true'
ADMIN_ACTIONS = {'create', 'update', 'partial_update', 'destroy'}
GET = 'GET'
POST = 'POST'
DELETE = 'DELETE'
PUT = 'PUT'

RACK_ORDERING_FILTERING_FIELDS = ['rack_number', 'datacenter']
RACK_DESTROY_SINGLE_ERR_MSG = 'Cannot delete rack as it contains the following assets:'
RACK_MANY_INCOMPLETE_QUERY_PARAMS_ERROR_MSG = 'Invalid rack range- must specify start and end rack number'
RACK_MANY_BAD_LETTER_ERROR_MSG = 'Your start letter must be less than or equal to your end letter'
RACK_MANY_BAD_NUMBER_ERROR_MSG = 'Your start number must be less than or equal to your end number'
RACK_MANY_CREATE_EXISTING_RACK_WARNING_MSG = 'Warning: skipping rack {} as it already exists.'
RACK_MANY_DELETE_NONEXISTENT_ERROR_MSG = 'Error: rack {} cannot be deleted as it does not exist. Continuing...'
RACK_MANY_DELETE_NOT_EMPTY_ERROR_MSG = 'Error: rack {} cannot be deleted as it is not empty. Continuing...'


class RackViewSet(viewsets.ModelViewSet):

    # View Housekeeping (permissions, serializers, filter fields, etc
    def get_permissions(self):
        if self.action in ADMIN_ACTIONS:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    queryset = Rack.objects.all() \
        .annotate(rack_letter=Substr('rack_number', 1, 1)) \
        .annotate(numstr_in_rack=Substr('rack_number', 2))
    queryset = queryset.annotate(number_in_rack=Cast('numstr_in_rack', IntegerField()))

    ordering = ['rack_letter', 'number_in_rack']
    ordering_fields = RACK_ORDERING_FILTERING_FIELDS

    filter_backends = [OrderingFilter,
                       djfiltBackend.DjangoFilterBackend,
                       RackFilter]
    filterset_fields = RACK_ORDERING_FILTERING_FIELDS

    def get_serializer_class(self):
        if self.request.method == GET:
            serializer_class = RackFetchSerializer
        else:
            serializer_class = RackSerializer
        return serializer_class

    # Overriding of super functions
    def destroy(self, request, *args, **kwargs):
        slots = ['u{}'.format(i) for i in range(1, 43)]
        offending_assets = []
        for slot in slots:
            match = getattr(self.get_object(), slot)
            if match:
                offending_assets.append(match.hostname.__str__()
                                        + ' at ' +
                                        match.rack.rack_number.__str__() +
                                        ' ' +
                                        slot.__str__())
        if len(offending_assets) > 0:
            err_message = RACK_DESTROY_SINGLE_ERR_MSG + ', '.join(offending_assets)
            return Response({
                'Error:', err_message
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(self, request, *args, **kwargs)

    # New Actions
    @action(detail=False, methods=[GET])
    def filter_fields(self, request, *args, **kwargs):
        fields = RACK_ORDERING_FILTERING_FIELDS.copy()
        fields.extend(['rack_num_start', 'rack_num_end'])
        return Response({
            'filter_fields': fields
        })

    @action(detail=False, methods=[GET])
    def sorting_fields(self, request, *args, **kwargs):
        return Response({
            'sorting_fields': self.ordering_fields
        })

    @action(detail=False, methods=[POST, DELETE])
    def many(self, request, *args, **kwargs):
        try:
            dc = request.data['datacenter']
            srn = request.data['rack_num_start']
            ern = request.data['rack_num_end']
        except KeyError:
            return Response({
                'Error': RACK_MANY_INCOMPLETE_QUERY_PARAMS_ERROR_MSG
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            s_letter = srn[0].upper()
            e_letter = ern[0].upper()
            s_number = int(srn[1:])
            e_number = int(ern[1:])

            try:
                assert (s_letter <= e_letter)
            except AssertionError:
                return Response({
                    'Error': RACK_MANY_BAD_LETTER_ERROR_MSG
                }, status=status.HTTP_400_BAD_REQUEST)
            try:
                assert (s_number <= e_number)
            except AssertionError:
                return Response({
                    'Error': RACK_MANY_BAD_NUMBER_ERROR_MSG
                }, status=status.HTTP_400_BAD_REQUEST)

            rack_numbers = [x + y
                            for x in
                            (chr(i) for i in range(ord(s_letter), ord(e_letter) + 1))
                            for y in
                            (str(j) for j in range(s_number, e_number + 1))
                            ]
            results = []
            for rn in rack_numbers:
                rn_request_data = {
                    "datacenter": dc,
                    "rack_number": rn
                }
                if request.method == POST:
                    try:
                        serializer = self.get_serializer(data=rn_request_data)
                        serializer.is_valid(raise_exception=True)
                        serializer.save()
                        results.append(rn + ' successfully created')
                    except ValidationError:
                        results.append(RACK_MANY_CREATE_EXISTING_RACK_WARNING_MSG.format(rn))

                elif request.method == DELETE:
                    try:
                        rack = self.queryset.get(rack_number__iexact=rn)
                    except self.queryset.model.DoesNotExist:
                        results.append((RACK_MANY_DELETE_NONEXISTENT_ERROR_MSG.format(rn)))
                        continue
                    try:
                        rack.delete()
                    except ProtectedError:
                        results.append(RACK_MANY_DELETE_NOT_EMPTY_ERROR_MSG.format(rn))
                        continue
                    results.append(rn + ' successfully deleted')

        except (IndexError, ValueError) as e:
            return Response({
                'Error': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'results': ', '.join(results)
        }, status=status.HTTP_207_MULTI_STATUS)

    @action(detail=True, methods=[GET])
    def is_empty(self, request, *args, **kwargs):
        u_filled = 0
        slots = ['u{}'.format(i) for i in range(1, 43)]
        for field_name in slots:
            if getattr(self.get_object(), field_name):
                u_filled += 1
        if u_filled > 0:
            return Response({
                'is_empty': 'false'
            })
        return Response({
            'is_empty': 'true'
        })