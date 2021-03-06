# Generated by Django 3.0.3 on 2020-04-17 15:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ass_man', '0023_merge_20200416_1416'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='ovr_color',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
        migrations.AddField(
            model_name='asset',
            name='ovr_cpu',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='asset',
            name='ovr_memory',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='asset',
            name='ovr_storage',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='bladeserver',
            name='ovr_color',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
        migrations.AddField(
            model_name='bladeserver',
            name='ovr_cpu',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='bladeserver',
            name='ovr_memory',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bladeserver',
            name='ovr_storage',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
