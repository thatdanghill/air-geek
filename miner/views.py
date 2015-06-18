from django.shortcuts import render
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point
from django.template.defaultfilters import slugify

#-------------------------------------------------------------------
# Views
#-------------------------------------------------------------------

def pluginGraph(request, user_name, project_name, page_name, graph_name):
    try:
        user = User.objects.get(username=user_name.replace("_", " "))
        user_profile = UserProfile.objects.get(user = user)
        project = Project.objects.get(name=project_name.replace("_", " "), user=user_profile)
        page = Page.objects.get(name=page_name.replace("_", " "), project=project)
        graph = Graph.objects.get(name=graph_name.replace("_", " "), page=page)
    
        if request.method == 'GET':
            xs = request.GET.copy().getlist('x[]')
            ys = request.GET.copy().getlist('y[]')
            type = request.GET['type']
            
            if type == "string" :
                addStringPoints(xs, ys, graph)
            elif type == "month-year":
                addMonthPoints(xs, ys, graph)
            
            return HttpResponse("Points added")
        else:
            return HttpResponse("Http type error")
    
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    except Graph.DoesNotExist:
        pass

def pluginUser(request):
    try:
        if request.method == 'GET':
            userstr = request.GET['user']
            user = User.objects.get(username=userstr)
            userprofile = UserProfile.objects.get(user = user)
            projects = userprofile.projects.all()
            json = extractJson(projects)
            return HttpResponse(json)
        
        else:
            return HttpResponse("Http type error")
    except User.DoesNotExist:
        pass

#TODO: un-hardcode username
def index(request):
    try:
        context = {'projects': []}
        username = "super"
        user = User.objects.get(username = username)
        userprofile = UserProfile.objects.get(user = user)
        projects = userprofile.projects.all().order_by('name')
        for project in projects:
            url = "user/" + username + "/project/" + project.slug
            context['projects'].append({'name': project.name, 'url': url})
        return render(request, 'miner/index.html', context)
    except User.DoesNotExist:
        pass

#TODO: un-hardcode username
def project(request, user_name, project_name):
    try:
        username = "super"
        user = User.objects.get(username = user_name)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        pages = project.pages.all().order_by('name')
    
        context = {'pages' : []}
        
        for page in pages:
            url = "page/" + page.slug
            vals = getTableVals(user, project, page)
            context['pages'].append({'name': page.name, 'url': url, 'vals': vals})
    
        return render(request, 'miner/project-temp.html', context)
    
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

#TODO: un-hardcode username
def page(request, user_name, project_name, page_name):
    try:
        username = "super"
        user = User.objects.get(username = user_name)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        page = Page.objects.get(project = project, slug=page_name)
        graphs = page.graphs.all().order_by('name')

        context = {'graphs' : []}

        for graph in graphs:
            context['graphs'].append({'name':graph.name})

        return render(request, 'miner/page-temp.html', context)

    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    except Page.DoesNotExist:
        pass


#-------------------------------------------------------------------
# Helpers
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# pluginUser

def extractJson(projects):
    str = '['
    for project in projects:
        str += '{"projName": "' + project.name + '", "pages": ['
        pages = project.pages.all()
        for page in pages:
            str += '{"pageName": "' + page.name + '", "graphs": ['
            graphs = page.graphs.all()
            for graph in graphs:
                str += '{"graphName": "' + graph.name + '"},'
            if graphs.count() > 0:
                str = str[:-1]
            str += ']},'
        if pages.count() > 0:
            str = str[:-1]
        str += ']},'
    if projects.count() > 0:
        str = str[:-1]
    str += ']'
    return str

#-------------------------------------------------------------------
# pluginGraph

def addStringPoints(x, y, graph):
    points = graph.points.order_by('index')
    length = points.count()
    for i in range(length):
        q = points[i]
        q.index = i
        q.save()
    for i in range(len(x)):
        ind = length + i
        p = Point.objects.create(index=ind, x = xs[i], y= float(ys[i]), graph=graph)[0]
        p.save()

def addMonthPoints(x,y,graph):
    points = graph.points.order_by('index')
    length = points.count()
    for i in range(length):
        q = points[i]
        q.index = i
        q.save()
    for i in range(len(x)):
        placeInOrder(x[i], y[i], points, graph)

def placeInOrder(x, y, points, graph):
    spl = x.split(" ")
    month = spl[0]
    year = int(spl[1])
    
    if points.count() == 0:
        p = Point.objects.create(index = 0, x = x, y = float(y), graph= graph)
        p.save()
        return
    
    ind = findIndex(year, month, points)
    
    for i in range(ind, points.count()):
        q = points[i]
        q.index += 1
        q.save()

    p = Point.objects.create(index = ind, x = x, y = float(y), graph= graph)
    p.save()

def findIndex(year, month, points):
    moDic = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    i = 0
    if points.count() == 0:
        print("This shouldn't happen")
        return 0
    
    while i < points.count() and int(points[i].x.split(" ")[1]) < year:
        i = i + 1

    while i < points.count() and int(points[i].x.split(" ")[1]) == year and moDic.index(points[i].x.split(" ")[0].lower()) % 12 > moDic.index(month.lower()) % 12:
        i = i + 1
    return i

#-------------------------------------------------------------------
# project

def getTableVals(user, project, page):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        return calculateYoy(getRecentValues(graph.points.all()), graph.points.all())
    except Graph.DoesNotExist:
        return []

def getRecentValues(points):
    return orderedFilter(points, findMaxYear(points))

def calculateYoy(points, all):
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    vals = []
    try:
        year = int(points[0].x.split(" ")[1]) - 1
        for point in points:
            vals.append(point.y)
            month = point.x.split(" ")[0]
            for pt in all:
                if year == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p = pt
            v = round(((point.y / p.y) * 100) - 100, 2)
            vals.append(v)
        return vals
    except AttributeError:
        for i in range(len(vals), 24):
            vals.append("-")
        return vals

def findMaxYear(points):
    max = 0
    for point in points:
        ptyr = int(point.x.split(" ")[1])
        if ptyr > max:
            max = ptyr
    return max

def orderedFilter(points, year):
    return orderByMonth(filterYear(points, year))

def filterYear(points, year):
    pts = []
    for point in points:
        if int(point.x.split(" ")[1]) == year:
            pts.append(point)
    return pts

def orderByMonth(points):
    pts = [" "]*12
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    for point in points:
        pts[mos.index(point.x.split(" ")[0].lower()) % 12] = point
    return pts

