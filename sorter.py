import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air-geek.settings')

import django
django.setup()

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point

def sort():
    try:
        user = User.objects.get(username = 'super')
        userprofile = UserProfile.objects.get(user = user)
        projects = userprofile.projects.all()
        for project in projects:
            pages = project.pages.all()
            for page in pages:
                graphs = page.graphs.all()
                for graph in graphs:
                    sortGraph(graph.points.all())
    
    except User.DoesNotExist:
        print("Tell Daniel: User does not exist")
    except User.DoesNotExist:
        print("Tell Daniel: UserProfile does not exist")

def sortGraph(points):
    array = []
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    for point in points:
        x = point.x
        month = x.split(" ")[0]
        year = int(x.split(" ")[1])
        monthIndex = mos.index(month.lower()) % 2

        i = 0
        while i < len(array) and year < int(array[i].x.split(" ")[1]):
             i += 1
        
        while i < len(array) and year == int(array[i].x.split(" ")[1]) and monthIndex < mos.index(array[i].x.split(" ")[0].lower()) % 2:
             i += 1
        
        array.insert(i, point)

    for i in range(len(array)):
        q = array[i]
        q.index = i
        q.save()


if __name__ == '__main__':
    sort()