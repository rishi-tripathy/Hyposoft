# Generated by Django 3.0.2 on 2020-02-17 06:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ass_man', '0006_auto_20200217_0523'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rack',
            name='pdu_l',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pdu_l', to='ass_man.PDU'),
        ),
        migrations.AlterField(
            model_name='rack',
            name='pdu_r',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pdu_r', to='ass_man.PDU'),
        ),
    ]
