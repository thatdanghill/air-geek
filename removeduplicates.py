import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point

def removeDuplicates():
    try:
        user = User.objects.get(username = 'super')
        userprofile = UserProfile.objects.get(user = user)
        projects = userprofile.projects.all()
        for project in projects:
            pages = project.pages.all()
            for page in pages:
                graphs = page.graphs.all()
                for graph in graphs:
                    getRidOfEm(graph.points.all().order_by('index'))

    except User.DoesNotExist:
        print("Tell Daniel: User does not exist")
    except UserProfile.DoesNotExist:
        print("Tell Daniel: UserProfile does not exist")

def getRidOfEm(points):
    toDelete = []
    for i in range(points.count() - 1):
        if sameMonth(points[i], points[i+1]) and sameYear(points[i], points[i+1]):
            toDelete.append(points[i+1])
    for point in toDelete:
        point.delete()

def sameMonth(first, second):
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    return mos.index(first.x.split(" ")[0].lower()) % 12 == mos.index(second.x.split(" ")[0].lower()) % 12

def sameYear(first, second):
    return first.x.split(" ")[1] == second.x.split(" ")[1]

if __name__ == '__main__':
    removeDuplicates()