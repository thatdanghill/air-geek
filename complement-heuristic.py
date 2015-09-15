import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()
from miner.models import Project, Page, Graph, Continent
from django.core.exceptions import ObjectDoesNotExist

for project in Project.objects.all():
    for page in project.pages.all():
        for graph in page.graphs.all():
            graph.complement = ''
            graph.save()
            if "Load-Factor" in graph.name:
                newname = graph.name.replace("Load-Factor", "Passenger-Volume")
                try:
                    comp = graph.page.graphs.get(name=newname)
                    graph.complement = newname
                    graph.save()
                except Graph.DoesNotExist:
                    pass