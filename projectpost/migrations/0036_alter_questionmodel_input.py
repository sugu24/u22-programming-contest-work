# Generated by Django 3.2.5 on 2021-08-20 05:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectpost', '0035_questionmodel_input'),
    ]

    operations = [
        migrations.AlterField(
            model_name='questionmodel',
            name='input',
            field=models.TextField(),
        ),
    ]
