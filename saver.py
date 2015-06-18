import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()
from miner.models import Project, Page, Graph

for project in Project.objects.all():
    project.save()

for page in Page.objects.all():
    page.save()

for graph in Graph.objects.all():
    graph.save()