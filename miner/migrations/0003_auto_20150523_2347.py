# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('miner', '0002_point'),
    ]

    operations = [
        migrations.AlterField(
            model_name='point',
            name='index',
            field=models.IntegerField(unique=True),
            preserve_default=True,
        ),
    ]
