# Generated by Django 3.2.5 on 2021-08-12 04:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectpost', '0011_alter_usermodel_created_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='groupmodel',
            name='members',
            field=models.TextField(default=''),
        ),
        migrations.AlterField(
            model_name='groupmodel',
            name='questions',
            field=models.TextField(default=''),
        ),
    ]