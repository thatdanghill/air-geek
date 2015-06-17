import sys, getopt
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point

def addGraphs():
    graphsToAdd= []
    try:
        title = sys.argv[1]
        user = User.objects.get(username = 'super')
        userprofile = UserProfile.objects.get(user = user)
        project_name = sys.argv[2]
        project = Project.objects.get(user=userprofile, name=project_name)
        page_name = sys.argv[3]
        page = Page.objects.get(project = project, name = page_name)
        total_graph = Graph.objects.create(name = title, page = page)
        total_graph.save();
    except User.DoesNotExist:
        print("User is not valid")
        sys.exit(2)
    except UserProfile.DoesNotExist:
        print("UserProfile is not valid")
        sys.exit(2)
    except Project.DoesNotExist:
        print("Project does not exist!")
        sys.exit(2)
    except Page.DoesNotExist:
        print("Page does not exist!")
        sys.exit(2)
    except IndexError:
        print("Script requires at least 5 arguments: title of new graph, project name and page name, and 2 graphs")
        sys.exit(2)

    try:
        i = 4
        while True:
            graph_name = sys.argv[i]
            graph = Graph.objects.get(page = page, name = graph_name)
            graphsToAdd.append(graph)
            i += 1
    except Graph.DoesNotExist:
        print("Graph does not exist!")
        sys.exit(2)
    except IndexError:
        if len(graphsToAdd) < 2:
            print("At least 2 graphs need to be added")
            sys.exit(2)
        points = []
        for graph in graphsToAdd:
            for point in graph.points.all():
                points.append(point)
        compareAndAdd(points, total_graph)
        sort(total_graph.points.all())

def compareAndAdd(points, graph):
    while len(points) > 0:
        point = points[0]
        points.remove(point)
        year = int(point.x.split(" ")[1])
        month = point.x.split(" ")[0]
        y = point.y
        points = createSum(points, year, month, y, graph)

def createSum(points, year, month, y, graph):
    sum = y
    x = month + " " + str(year)
    i = 0
    while i < len(points):
        point = points[i]
        if compareYear(point, year) and compareMonth(point, month):
            sum += point.y
            points.remove(point)
            i -= 1
        i += 1
    p = Point.objects.create(x = x, y = sum, index = 0, graph = graph)
    p.save()
    return points

def compareYear(point, year):
    return int(point.x.split(" ")[1]) == year

def compareMonth(point, month):
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    return mos.index(month.lower()) % 12 == mos.index(point.x.split(" ")[0].lower()) % 12

def sort(points):
    array = []
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    for point in points:
        i = 0
        x = point.x
        month = x.split(" ")[0]
        year = int(x.split(" ")[1])
        monthIndex = mos.index(month.lower()) % 12
        
        while i < len(array) and year < int(array[i].x.split(" ")[1]):
            i += 1
        
        while i < len(array) and year == int(array[i].x.split(" ")[1]) and monthIndex < mos.index(array[i].x.split(" ")[0].lower()) % 12:
            i += 1
        
        array.insert(i, point)
    
    for j in range(len(array)):
        q = array[j]
        q.index = len(array) - j - 1
        q.save()

if __name__ == '__main__':
    addGraphs()