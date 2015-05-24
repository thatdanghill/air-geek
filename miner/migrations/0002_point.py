# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('miner', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Point',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('index', models.IntegerField()),
                ('x', models.CharField(max_length=40)),
                ('y', models.FloatField()),
                ('graph', models.ForeignKey(to='miner.Graph')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
