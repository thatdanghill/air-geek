from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point
from django.template.defaultfilters import slugify


#-------------------------------------------------------------------
# Global values

mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

YEARS = 1
MONTHS = 4
  
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
        
        proj_array = []
        for project in projects:
            proj_url = "user/" + username + "/project/" + project.slug
            page_array = []
            maxYear = findAllMaxYear(project)
            maxMonth = findMaxMonth(project, maxYear)
            for page in project.pages.all().order_by('name'):
                page_url = proj_url + "/page/" + page.slug
                ytdvals = getPageYTDStats(page, maxMonth, maxYear)
                ytdyoy = getPageYTDYoyStats(page, maxMonth, maxYear)
                page_release = getSymbolForRelease(page)
                page_data_type = getDataTypeSymbol(page)
                page_array.append({'name': page.name, 'url': page_url, 'YTDvals': ytdvals, 'YTDYoy': ytdyoy, 'data_type': page_data_type, 'release' : page_release})
            proj_array.append({'name': project.name, 'url' : proj_url, 'pages':page_array, 'columns': columnize(maxMonth, maxYear)})
            
        context['projects'] = proj_array
            
        return render(request, 'miner/index.html', context)
    except User.DoesNotExist:
        pass

#TODO: un-hardcode username
def project(request, user_name, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = user_name)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        pages = project.pages.all().order_by('name')
        
        max = 0
        for page in pages:
            try:
                graph = Graph.objects.get(page = page, name = page.table)
                yr = findMaxYear(graph.points.all())
                if yr > max:
                    max = yr
            except Graph.DoesNotExist:
                pass
    
        context = {'pages' : [], 'year': max, 'paths': {'home_url': BASE_DIR, 'project': project.name}}
        
        for page in pages:
            url = "page/" + page.slug

            volume_vals = getVolumeVals(page)
            yoy_vals = getYoyValues(page)
            yoy2_vals = get2YoyValues(page)
            context['pages'].append({'name': page.name, 'url': url, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})

    
        return render(request, 'miner/project-temp.html', context)
    
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

#TODO: un-hardcode username
def page(request, user_name, project_name, page_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = user_name)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        page = Page.objects.get(project = project, slug=page_name)
        graphs = page.graphs.all().order_by('name')
        
        dir_str = 'user/' + user_name + '/project/' + project_name
        rel_dir = BASE_DIR + dir_str
        context = {'graphs' : [], 'paths': {'home_url': BASE_DIR, 'project':{'name': project.name, 'url': rel_dir}, 'page': page.name}}

        for graph in graphs:
            url = "graph/" + graph.slug
            context['graphs'].append({'name':graph.name, 'url': url})

        return render(request, 'miner/page-temp.html', context)

    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    except Page.DoesNotExist:
        pass

def graph(request, user_name, project_name, page_name, graph_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = user_name)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        page = Page.objects.get(project = project, slug=page_name)
        graph = Graph.objects.get(page=page, slug=graph_name)
        
        proj_dir = BASE_DIR + 'user/' + user_name + '/project/' + project_name
        page_dir = proj_dir + '/page/' + page_name
        context = {'paths': {'home_url': BASE_DIR, 'user': user_name, 'project':{'name': project.name, 'url': proj_dir}, 'page': {'name': page.name, 'url': page_dir}, 'graph': graph.name}}
        
        return render(request, 'miner/graph-temp.html', context)
    
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    except Page.DoesNotExist:
        pass

def allPoints(request):
    try:
        if request.method == 'GET':
            username = request.GET['user']
            projectname = request.GET['project']
            pagename = request.GET['page']
            graphname = request.GET['graph']
            user = User.objects.get(username=username)
            up = UserProfile.objects.get(user=user)
            project = up.projects.get(name=projectname)
            page = project.pages.get(name=pagename)
            graph = page.graphs.get(name=graphname)
            return JsonResponse(pointQueryToJSON(graph))
        
        else:
            return HttpResponse('')
    except User.DoesNotExist:
        return HttpResponse('')
    except UserProfile.DoesNotExist:
        return HttpResponse('')
    except Project.DoesNotExist:
        return HttpResponse('')
    except Page.DoesNotExist:
        return HttpResponse('')
    except Graph.DoesNotExist:
        return HttpResponse('')



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

    p = Point.objects.create(index = ind, x = x, y=float(y), graph= graph)
    p.save()

def calculateRealValue(y, graph):
    if graph.thousand:
        return y * 1000
    elif graph.million:
        return y * 1000000
    elif graph.billion:
        return y * 1000000000
    else:
        return y

def findIndex(year, month, points):
    i = 0
    if points.count() == 0:
        print("This shouldn't happen")
        return 0
    
    while i < points.count() and int(points[i].x.split(" ")[1]) < year:
        i = i + 1

    while i < points.count() and int(points[i].x.split(" ")[1]) == year and mos.index(points[i].x.split(" ")[0].lower()) % 12 > mos.index(month.lower()) % 12:
        i = i + 1
    return i

#-------------------------------------------------------------------
# project

def getProjectTableVals(page, maxyr):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        return calculateYoy(getRecentValues(graph.points.all(), maxyr), graph.points.all())
    except Graph.DoesNotExist:
        return []
         
def getVolumeVals(page):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12*YEARS
    vals = []
    recentVals = getRecentValues(points)
    for pt in recentVals:
        if pt:
            vals.append(formatThousands(int(calculateRealValue(pt.y, graph))))
        else:
            vals.append("-")
    return vals

def getRecentValues(points):
    return orderedFilter(points, findMaxYear(points))

def getYoyValues(page):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = getRecentValues(graph.points.all())
        all = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12*YEARS
    vals = []
    for point in points:
        if hasattr(point, 'x'):
            p = None
            year = int(point.x.split(" ")[1]) - 1
            month = point.x.split(" ")[0]
            for pt in all:
                if year == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p = pt
            if p:
                v = round((((point.y / p.y) -1))*100, 2)
                vals.append(v)
            else:
                vals.append("-")
        else:
            vals.append("-")
            
    return vals

def get2YoyValues(page):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = getRecentValues(graph.points.all())
        all = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12*YEARS
    vals = []
    for point in points:
        if hasattr(point, 'x'):
            p1 = None
            p2 = None
            year = int(point.x.split(" ")[1])
            month = point.x.split(" ")[0]
            for pt in all:
                if (year - 2) == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p2 = pt
                if (year - 1) == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p1 = pt
            if p1 and p2 and p1.y != 0 and p2.y != 0:
                v = round(((((p1.y / p2.y)*(point.y / p1.y)) - 1)*100), 2)
                vals.append(v)
            else:
                vals.append("-")
        else:
                vals.append("-")
    return vals
        
            

def calculateYoy(points, all):
    vals = []
    for point in points:
        if hasattr(point, 'x'):
            p = None
            year = int(point.x.split(" ")[1]) - 1
            vals.append(formatThousands(int((calculateRealValue(point.y, point.graph)))))
            month = point.x.split(" ")[0]
            for pt in all:
                if year == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p = pt
            if p:
                v = round(((point.y / p.y) * 100) - 100, 2)
                vals.append(v)
            else:
                vals.append("-")
                vals.append("-")
    return vals

def formatThousands(num):
    if num == 0:
        return "-"
    else:
        return "{:,}".format(num)

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
    pts = [None]*12
    for point in points:
        pts[mos.index(point.x.split(" ")[0].lower()) % 12] = point
    return pts

def calculateYTD(points):
    sum = 0
    for point in points:
        if hasattr(point, 'y'):
            sum = sum + point.y
    return sum

#-------------------------------------------------------------------
# allPoints

def pointQueryToJSON(graph):
    context = {"points":[]}
    points = graph.points.all().order_by('index')
    for point in points:
        context['points'].append([point.x, point.y])
    return context

def getDataTypeSymbol(data_type):
    if data_type == "PAX":
        return ""
    elif data_type == "RPKs":
        return "**"
    else:
        return "*"
    
def getSymbolForRelease(page):
    if page.quarterly:
        return "^"
    else:
        return ""
    if page.annualy:
        return "^^"
    else:
        return ""
        

#-------------------------------------------------------------------
# index

def findAllMaxYear(project):
    max = 0
    for page in project.pages.all():
        try:
            graph = Graph.objects.get(page = page, name = page.table)
            yr = findMaxYear(graph.points.all())
            if yr > max:
                max = yr
        except Graph.DoesNotExist:
            pass
    return max

def findMaxMonth(project, year):
    max = 0
    for page in project.pages.all():
        try:
            graph = Graph.objects.get(page = page, name = page.table)
            points = filterYear(graph.points.all(), year)
            for point in points:
                mi = mos.index(point.x.split(" ")[0].lower()) % 12
                if mi > max:
                    max = mi
        except Graph.DoesNotExist:
            pass
    return max

def columnize(monthIndex, year):
    columns = []
    for i in range(MONTHS):
        month = mos[(monthIndex - i)%12]
        columns.append(month.capitalize() + " " + str(year))
    columns.reverse()
    return columns

def getPageYTDStats(page, month, year):
    vals = []
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        for i in range(MONTHS):
            if month - i < 0:
                vals.append(formatThousands(monthYTD(month%12, year-1, graph.points.all())))
            else:
                vals.append(formatThousands(monthYTD(month%12, year, graph.points.all())))
    except Graph.DoesNotExist:
        vals = ["-"]*MONTHS
    vals.reverse()
    return vals

def getPageYTDYoyStats(page, month, year):
    vals = []
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        for i in range(MONTHS):
            if month - i < 0:
                vals.append(monthYOY(month%12, year-1, graph.points.all()))
            else:
                vals.append(monthYOY(month%12, year, graph.points.all()))
    
    except Graph.DoesNotExist:
        vals = ["-"]*MONTHS
    vals.reverse()
    return vals

def monthYTD(month, year, pointList):
    points = filterYear(pointList, year)
    sum = 0
    pval = 0
    for i in range(month%12 + 1):
        j = 0
        for point in points:
            if i == mos.index(point.x.split(" ")[0].lower())%12:
                j = 1
                pval = point.y
        if j == 1:
            sum += pval
        else:
            return 0
    return sum

def monthYOY(month, year, points):
    num = monthYTD(month, year, points)
    denom = monthYTD(month, year-1, points)
    if num == 0 or denom == 0:
        return "-"
    return round((num/denom)*100 - 100,2)