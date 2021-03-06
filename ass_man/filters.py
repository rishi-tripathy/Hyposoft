from rest_framework import generics
from django_filters import rest_framework as filters
from ass_man.models import Model, Asset, Rack, Decommissioned, AllAssets
from rest_framework import filters as rest_filters
from django.db.models.fields import IntegerField
from django.db.models.functions import Substr, Cast, Length

import django.db.models as models
from rest_framework.validators import ValidationError
from rest_framework.response import Response

class AllAssetsFilter(filters.FilterSet):
    datacenter = filters.NumberFilter(field_name='datacenter', lookup_expr='exact')
    model = filters.NumberFilter(field_name='model', lookup_expr='exact')
    vendor = filters.CharFilter(field_name='vendor', lookup_expr='icontains')
    model_number = filters.CharFilter(field_name='model_number', lookup_expr='icontains')
    mount_type = filters.CharFilter(field_name='mount_type', lookup_expr='icontains')
    hostname = filters.CharFilter(field_name='hostname', lookup_expr='icontains')
    owner = filters.NumberFilter(field_name='owner', lookup_expr='exact')
    comment = filters.CharFilter(field_name='comment', lookup_expr='icontains')
    rack_u = filters.NumberFilter(field_name='rack_u', lookup_expr='exact')
    slot_number = filters.NumberFilter(field_name='slot_number', lookup_expr='exact')
    location = filters.NumberFilter(field_name='location', lookup_expr='exact')
    class Meta:
        model = AllAssets
        fields = ['model', 'datacenter', 'model_number',
        'vendor', 'mount_type', 'hostname', 'owner', 'rack_u', 'slot_number', 'location']

class DecommissionedFilter(filters.FilterSet):
    username = filters.CharFilter(field_name='username', lookup_expr='icontains')
    timestamp = filters.IsoDateTimeFromToRangeFilter(field_name='timestamp', lookup_expr='range')
    # timestamp = filters.DateTimeFromToRangeFilter(field_name='timestamp', lookup_expr='range')

    class Meta:
        model = Decommissioned
        fields = ['username', 'timestamp']

class ModelFilter(filters.FilterSet):
    vendor = filters.CharFilter(field_name='vendor', lookup_expr='icontains')
    model_number = filters.CharFilter(field_name='model_number', lookup_expr='icontains')
    height = filters.NumericRangeFilter(field_name='height', lookup_expr='range')
    color = filters.CharFilter(field_name='display_color', lookup_expr='iexact')
    network_ports_num = filters.NumericRangeFilter(field_name='network_ports_num', lookup_expr='range')
    power_ports = filters.NumericRangeFilter(field_name='power_ports', lookup_expr='range')
    cpu = filters.CharFilter(field_name='cpu', lookup_expr='icontains')
    memory = filters.NumericRangeFilter(field_name='memory', lookup_expr='range')
    storage = filters.CharFilter(field_name='storage', lookup_expr='icontains')
    comment = filters.CharFilter(field_name='comment', lookup_expr='icontains')

    class Meta:
        model = Model
        fields = ['vendor', 'model_number', 'height', 'color', 'network_ports_num',
                  'power_ports', 'cpu', 'memory', 'storage', 'comment']


class AssetFilter(filters.FilterSet):
    datacenter = filters.NumberFilter(field_name='datacenter__pk', lookup_expr='exact')
    model = filters.NumberFilter(field_name='model__pk', lookup_expr='exact')
    vendor = filters.CharFilter(field_name='model__vendor', lookup_expr='icontains')
    model_number = filters.CharFilter(field_name='model__model_number', lookup_expr='icontains')
    hostname = filters.CharFilter(field_name='hostname', lookup_expr='icontains')
    owner_username = filters.CharFilter(field_name='owner__username', lookup_expr='icontains')
    comment = filters.CharFilter(field_name='comment', lookup_expr='icontains')

    class Meta:
        model = Asset
        fields = ['datacenter', 'vendor', 'model_number', 'hostname', 'owner', 'comment']

class AllAssetFilterByRack(rest_filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        #queryset = queryset.filter(datacenter__is_offline=False)
        # if request.query_params.get('offline') is True:
        #     return queryset.exclude(datacenter__is_offline=True)
        # else:
        #     queryset = queryset.exclude(datacenter__is_offline=True)

        if request.query_params.get('rack_num_start'):
            start_letter = request.query_params.get('rack_num_start')[0].upper() if request.query_params.get(
                'rack_num_start') else 'A'
            start_number = request.query_params.get('rack_num_start')[1:] if request.query_params.get(
                'rack_num_start') else '0'
            end_letter = request.query_params.get('rack_num_end')[0].upper() if request.query_params.get('rack_num_end') \
                else 'Z'
            end_number = request.query_params.get('rack_num_end')[1:] if request.query_params.get('rack_num_end') \
                else '999'

            queryset = queryset \
                .annotate(rack_letter=Substr('rack_number', 1, 1)) \
                .annotate(rack_numstr=Substr('rack_number', 2, None))
            queryset = queryset.annotate(rack_number_int=Cast('rack_numstr', IntegerField()))

            return queryset \
                .filter(rack_letter__range=(start_letter, end_letter)) \
                .filter(rack_number_int__range=(start_number, end_number))
        else:
            return queryset

class AssetFilterByRack(rest_filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        # if request.query_params.get('offline') == 'true' or request.method is not 'GET':
        #     return queryset
        #
        if request.method is not 'GET' or 'get':
            return queryset

        if request.query_params.get('offline') is True:
            return queryset

        start_letter = request.query_params.get('rack_num_start')[0].upper() if request.query_params.get(
            'rack_num_start') else 'A'
        start_number = request.query_params.get('rack_num_start')[1:] if request.query_params.get(
            'rack_num_start') else '0'
        end_letter = request.query_params.get('rack_num_end')[0].upper() if request.query_params.get('rack_num_end') \
            else 'Z'
        end_number = request.query_params.get('rack_num_end')[1:] if request.query_params.get('rack_num_end') \
            else '999'

        queryset = queryset \
            .annotate(rack_letter=Substr('rack_number', 1, 1)) \
            .annotate(rack_numstr=Substr('rack_number', 2, None))
        queryset = queryset.annotate(rack_number_int=Cast('rack_numstr', IntegerField()))

        return queryset \
            .filter(rack_letter__range=(start_letter, end_letter)) \
            .filter(rack_number_int__range=(start_number, end_number))

# class AssetFilterByRack(rest_filters.BaseFilterBackend):
#     def filter_queryset(self, request, queryset, view):
#         if request.query_params.get('offline') == 'true' or request.method is not 'GET':
#             return queryset

#         start_letter = request.query_params.get('rack_num_start')[0].upper() if request.query_params.get(
#             'rack_num_start') else 'A'
#         start_number = request.query_params.get('rack_num_start')[1:] if request.query_params.get(
#             'rack_num_start') else '0'
#         end_letter = request.query_params.get('rack_num_end')[0].upper() if request.query_params.get('rack_num_end') \
#             else 'Z'
#         end_number = request.query_params.get('rack_num_end')[1:] if request.query_params.get('rack_num_end') \
#             else '999'

#         queryset = queryset \
#             .annotate(rack_letter=Substr('rack__rack_number', 1, 1)) \
#             .annotate(rack_numstr=Substr('rack__rack_number', 2, None))
#         queryset = queryset.annotate(rack_number_int=Cast('rack_numstr', IntegerField()))

#         return queryset \
#             .filter(rack_letter__range=(start_letter, end_letter)) \
#             .filter(rack_number_int__range=(start_number, end_number))


class RackFilter(rest_filters.BaseFilterBackend):
    datacenter = filters.NumberFilter(field_name='datacenter__pk', lookup_expr='exact')

    def filter_queryset(self, request, queryset, view):
        start_letter = request.query_params.get('rack_num_start')[0].upper() if request.query_params.get(
            'rack_num_start') else 'A'
        start_number = request.query_params.get('rack_num_start')[1:] if request.query_params.get(
            'rack_num_start') else '0'
        end_letter = request.query_params.get('rack_num_end')[0].upper() if request.query_params.get('rack_num_end') \
            else 'Z'
        end_number = request.query_params.get('rack_num_end')[1:] if request.query_params.get('rack_num_end') \
            else '999'
        return queryset \
            .filter(rack_letter__range=(start_letter, end_letter)) \
            .filter(number_in_rack__range=(start_number, end_number))

    class Meta:
        model = Rack
        fields = ['datacenter']
