import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()
from miner.models import Project, Page, Graph, Continent

Continent.objects.get_or_create(name = "Africa")
Continent.objects.get_or_create(name = "Antarctica")
Continent.objects.get_or_create(name = "South America")
Continent.objects.get_or_create(name = "North America")
Continent.objects.get_or_create(name = "Europe")
Continent.objects.get_or_create(name = "Oceania")
Continent.objects.get_or_create(name = "Asia")

