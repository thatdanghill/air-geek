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
                passname = graph.name.replace("Load-Factor", "Passenger-Volume")
                rpmsname = graph.name.replace("Load-Factor", "RPMs")
                rpksname = graph.name.replace("Load-Factor", "RPKs")
                try:
                    comp = graph.page.graphs.get(name=passname)
                    graph.complement = passname
                    graph.save()
                except Graph.DoesNotExist:
                    try:
                        comp = graph.page.graphs.get(name=rpmsname)
                        graph.complement = rpmsname
                        graph.save()
                    except Graph.DoesNotExist:
                        try:
                            comp = graph.page.graphs.get(name=rpksname)
                            graph.complement = rpksname
                            graph.save()
                        except Graph.DoesNotExist:
                            pass