# Generated by Django 3.2.5 on 2021-08-15 04:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projectpost', '0026_alter_usermodel_join_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usermodel',
            name='join_group',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.SET_DEFAULT, to='projectpost.groupmodel'),
        ),
    ]
