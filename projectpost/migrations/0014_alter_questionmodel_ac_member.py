# Generated by Django 3.2.5 on 2021-08-12 06:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectpost', '0013_alter_groupmodel_admin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='questionmodel',
            name='ac_member',
            field=models.TextField(default=''),
        ),
    ]
