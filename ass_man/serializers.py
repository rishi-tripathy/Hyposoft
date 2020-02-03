from ass_man.models import Model, Instance, Rack
from rest_framework import serializers, status
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator
from django.core.validators import MinLengthValidator, MinValueValidator
from usr_man.serializers import UserOfInstanceSerializer
import re


class ModelSerializer(serializers.HyperlinkedModelSerializer):
    display_color = serializers.CharField()

    def validate_display_color(self, value):
        if not re.match('^[A-Fa-f0-9]{6}$', value):
            raise serializers.ValidationError(
                '{} is not an valid color. '
                'Please ensure this value is a RGB specifier between 000000-FFFFFF'.format(value.__str__())
            )
        return value

    class Meta:
        model = Model
        fields = ['id', 'vendor', 'model_number', 'height', 'display_color',
                  'ethernet_ports', 'power_ports', 'cpu', 'memory', 'storage', 'comment']
        validators = [
            UniqueTogetherValidator(
                queryset=Model.objects.all(),
                fields=['vendor', 'model_number']
            )
        ]


class ModelShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Model
        fields = ['id', 'vendor', 'model_number', 'height', 'display_color', 'ethernet_ports', 'power_ports','cpu', 'memory', 'storage']

class UniqueModelsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Model
        fields = ['id', 'url', 'vendor', 'model_number']


class ModelInstanceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Model
        fields = ['url', 'vendor', 'model_number', 'display_color']


class VendorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = ['vendor', 'url']
<<<<<<< HEAD
=======

>>>>>>> 03e3a9c43312cf02201cfac700ba54be32741cc6

class InstanceSerializer(serializers.HyperlinkedModelSerializer):
    hostname = serializers.CharField(validators=[UniqueValidator(queryset=Instance.objects.all())])
    rack_u = serializers.IntegerField(validators=[MinValueValidator(1)])
    # model = ModelInstanceSerializer()

    def check_rack_u_validity(self, validated_data, instance=None):
        rack = validated_data['rack']
        rack_u = validated_data['rack_u']
        model = validated_data['model']
        height = model.height
        invalid_list = []
        if (rack_u+height-1) > 42:
            raise serializers.ValidationError({
                'Height conflict': 'this instance would exceed past the top of the rack.'
            })
        for i in range(rack_u, rack_u+height):
            if eval('rack.u{} and (rack.u{} != instance)'.format(i, i)):
                invalid_list.append('Conflict: host ' +
                                    eval('rack.u{}.__str__()'.format(i)) +
                                    ' conflicts at U{}'.format(i))
        if len(invalid_list) > 0:
            raise serializers.ValidationError({
                'Invalid Rack U': invalid_list
            })
        return

    def create(self, validated_data):
        self.check_rack_u_validity(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self.check_rack_u_validity(validated_data, instance)
        return super().update(instance, validated_data)

    # adapted from https://stackoverflow.com/questions/2063213/regular-expression-for-validating-dns-label-host-name

    def validate_hostname(self, value):
        if not re.match('^(?![0-9]+$)(?!-)[a-zA-Z0-9-]{,63}(?<!-)$', value):
            raise serializers.ValidationError(
                '{} is not an valid hostname. Please ensure this value is a valid hostname as per RFC 1034.'.format(
                    value.__str__())
            )
        return value

    class Meta:
        model = Instance
        fields = ['id', 'model', 'hostname', 'rack', 'rack_u', 'owner', 'comment']

# Used to fetch the Rack associated with an Instance
class RackOfInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = ['url', 'rack_number']


# Used to fetch the Rack associated with an Instance
class RackOfInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = ['url', 'rack_number']


class InstanceFetchSerializer(InstanceSerializer):
    model = ModelInstanceSerializer()
    rack = RackOfInstanceSerializer()
    owner = UserOfInstanceSerializer()


class InstanceShortSerializer(InstanceSerializer):
    model = ModelInstanceSerializer()
    rack = RackOfInstanceSerializer()
    owner = UserOfInstanceSerializer()

    class Meta:
        model = Instance
        fields = ['id', 'model', 'hostname', 'rack', 'rack_u', 'owner']


class RackSerializer(serializers.HyperlinkedModelSerializer):
    rack_number = serializers.CharField(
        validators=[UniqueValidator(queryset=Rack.objects.all())]
    )

    def validate_rack_number(self, value):
        if not re.match('^[A-Z][0-9]+$', value):
            raise serializers.ValidationError(
                '{} is not a valid rack number. Please ensure this value is a capital letter followed by a positive number, e.g. "B12"'.format(value.__str__())
            )
        return value

    class Meta:
        model = Rack
        fields = ['id', 'rack_number', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10',
                  'u11', 'u12', 'u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20',
                  'u21', 'u22', 'u23', 'u24', 'u25', 'u26', 'u27', 'u28', 'u29', 'u30',
                  'u31', 'u32', 'u33', 'u34', 'u35', 'u36', 'u37', 'u38', 'u39', 'u40',
                  'u41', 'u42']


class InstanceOfModelSerializer(serializers.HyperlinkedModelSerializer):
    rack = RackOfInstanceSerializer()

    class Meta:
        model = Instance
        fields = ['id', 'url', 'hostname', 'rack', 'rack_u', 'owner']


class RackInstanceSerializer(serializers.ModelSerializer):
    model = ModelInstanceSerializer()

    class Meta:
        model = Instance
        fields = ['url', 'model', 'hostname']


class RackFetchSerializer(serializers.HyperlinkedModelSerializer):
    for i in range(1, 43):
        s = 'u{} = RackInstanceSerializer()'.format(i)
        exec(s)

    class Meta:
        model = Rack
        fields = ['id', 'url', 'rack_number', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10',
                  'u11', 'u12', 'u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20',
                  'u21', 'u22', 'u23', 'u24', 'u25', 'u26', 'u27', 'u28', 'u29', 'u30',
                  'u31', 'u32', 'u33', 'u34', 'u35', 'u36', 'u37', 'u38', 'u39', 'u40',
                  'u41', 'u42']
