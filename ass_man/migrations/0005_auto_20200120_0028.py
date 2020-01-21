# Generated by Django 3.0.2 on 2020-01-20 00:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ass_man', '0004_instance'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rack_number', models.CharField(max_length=4)),
                ('u1', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='instance1', to='ass_man.Instance')),
                ('u2', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='instance2', to='ass_man.Instance')),
                ('u3', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='instance3', to='ass_man.Instance')),
            ],
        ),
        migrations.AlterField(
            model_name='instance',
            name='rack',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='my_rack', to='ass_man.Rack'),
        ),
    ]
