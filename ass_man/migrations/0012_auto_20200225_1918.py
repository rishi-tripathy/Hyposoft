# Generated by Django 3.0.3 on 2020-02-25 19:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ass_man', '0011_power_port_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='power_port',
            name='port_number',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
