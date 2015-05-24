from django.shortcuts import render
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point

def graph(request, user_name, project_name, page_name, graph_name):
    try:
        user = User.objects.get(username=user_name)
        user_profile = UserProfile.objects.get(user = user)
        project = Project.objects.get(name=project_name, user=user_profile)
        page = Page.objects.get(name=page_name, project=project)
        graph = Graph.objects.get(name=graph_name, page=page)
    
        if request.method == 'GET':
            xs = request.GET.copy().getlist('x[]')
            ys = request.GET.copy().getlist('y[]')
            length = Point.objects.filter(graph=graph).count()
            for i in range(len(xs)):
                ind = length + i
                p = Point.objects.get_or_create(index=ind, x = xs[i], y= float(ys[i]), graph=graph)[0]
                p.save()
            
            return HttpResponse("Points added")
        else:
            return HttpResponse("Http type error")
    
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    except Graph.DoesNotExist:
        pass

def user(request):
    try:
        if request.method == 'GET':
            userstr = request.GET['user']
            user = User.objects.get(username=userstr)
            userprofile = UserProfile.objects.filter(user = user)
            assert userprofile.count() == 1
            projects = Project.objects.filter(user = userprofile)
            json = extractJson(projects)
            return HttpResponse(json)
        
        else:
            return HttpResponse("Http type error")
    except User.DoesNotExist:
        pass

def extractJson(projects):
    str = '['
    for project in projects:
        str += '{"projName": "' + project.name + '", "pages": ['
        pages = Page.objects.filter(project=project)
        for page in pages:
            str += '{"pageName": "' + page.name + '", "graphs": ['
            graphs = Graph.objects.filter(page=page)
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