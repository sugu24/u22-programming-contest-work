# Generated by Django 3.2.5 on 2021-08-17 01:40

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projectpost', '0033_remove_questionmodel_ac_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupmodel',
            name='admin_name',
            field=models.CharField(default='', max_length=20),
        ),
        migrations.AlterField(
            model_name='groupmodel',
            name='admin',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
