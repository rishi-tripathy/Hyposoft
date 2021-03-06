# Generated by Django 3.0.3 on 2020-03-28 23:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ass_man', '0016_merge_20200328_2230'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AssetCP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hostname', models.CharField(blank=True, max_length=64, null=True)),
                ('rack_u', models.PositiveIntegerField()),
                ('comment', models.TextField(blank=True)),
                ('id_ref', models.PositiveIntegerField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='PPCP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=10, null=True)),
                ('port_number', models.PositiveIntegerField(null=True)),
                ('id_ref', models.PositiveIntegerField(blank=True, null=True)),
                ('asset', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ass_man.Asset')),
                ('asset_cp_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='cp.AssetCP')),
                ('pdu', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ass_man.PDU')),
            ],
        ),
        migrations.CreateModel(
            name='NPCP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, default='mgmt', max_length=15)),
                ('mac', models.CharField(blank=True, max_length=17, null=True)),
                ('id_ref', models.PositiveIntegerField(blank=True, null=True)),
                ('asset', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ass_man.Asset')),
                ('asset_cp_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='cp.AssetCP')),
                ('conn_cp_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='cp.NPCP')),
                ('connection', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ass_man.Network_Port')),
            ],
        ),
        migrations.CreateModel(
            name='ChangePlan',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('datacenter', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='ass_man.Datacenter')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='assetcp',
            name='cp',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='cp.ChangePlan'),
        ),
        migrations.AddField(
            model_name='assetcp',
            name='datacenter',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='ass_man.Datacenter'),
        ),
        migrations.AddField(
            model_name='assetcp',
            name='model',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='ass_man.Model'),
        ),
        migrations.AddField(
            model_name='assetcp',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='assetcp',
            name='rack',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='ass_man.Rack'),
        ),
    ]
