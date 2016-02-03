from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.http import HttpResponseRedirect, HttpResponse
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point, Continent
from django.template.defaultfilters import slugify
from miner.forms import UserForm, UserProfileForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
import math


#-------------------------------------------------------------------
# Global values

mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

YEARS = 3
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
            url = request.GET['source']
            graph.url = url
            graph.save()
            
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

def index(request):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        context = {'projects': []}
        username = "super"
        user = User.objects.get(username = username)
        userprofile = UserProfile.objects.get(user = user)
        projects = userprofile.projects.all().order_by('name')
        for project in projects:
            proj_url = BASE_DIR + project.slug
            context['projects'].append({'name': project.name, 'url': proj_url})
        return render(request, 'miner/index.html', context)

    except User.DoesNotExist:
        pass

@login_required
def charts(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        userprofile = UserProfile.objects.get(user=user)
        project = userprofile.projects.get(slug = project_name)
        context = {'home': BASE_DIR, 'project': project.name, 'continents': []}
        for continent in Continent.objects.all().order_by('name'):
            pages = continent.pages.filter(project = project).order_by('name')
            continent_context = []
            for page in pages:
                url = BASE_DIR + project_name + "/charts/" + page.slug
                page_context = {'name': page.name, 'url': url}
                continent_context.append(page_context)
            context['continents'].append({'name': continent.name, 'pages': continent_context})
    
        return render(request, 'miner/charts.html', context)
    except User.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

#TODO: un-hardcode username
@login_required
def latestSummary(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        userprofile = UserProfile.objects.get(user = user)
        project = userprofile.projects.get(slug = project_name)
        
        proj_array = []
        proj_url = BASE_DIR + project.slug
        page_array = []
        maxYear = findAllMaxYear(project)
        maxMonth = findMaxMonthProject(project, maxYear)
        africa = []
        asia = []
        europe = []
        oceania = []
        northamerica = []
        southamerica = []
        for page in project.pages.all().order_by('name'):
            page_url = proj_url + "/charts/" + page.slug
            special_name = project.name[:-1]
            mthvals = getPageMthStats(page, maxMonth, maxYear)
            ytdvals = getPageYTDStats(page, maxMonth, maxYear)
            ytdyoy = getPageYTDYoyStats(page, maxMonth, maxYear)
            mthyoy = getPageMthYoyStats(page, maxMonth, maxYear)
            page_release = getSymbolForRelease(page)
            page_data_type = getDataTypeSymbol(page.data_type)
            if page.continent.name == 'Africa':
                africa.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
            elif page.continent.name == 'Asia':
                asia.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
            elif page.continent.name == 'Europe':
                europe.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
            elif page.continent.name == 'Oceania':
                oceania.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
            elif page.continent.name == 'North America':
                northamerica.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
            elif page.continent.name == 'South America':
                southamerica.append({'name':page.name, 'url':page_url, 'mthvals':mthvals, 'ytdvals':ytdvals, 'ytdyoy':ytdyoy, 'mthyoy':mthyoy, 'data_type': page_data_type, 'release' : page_release})
        context = {'home': BASE_DIR, 'project': project.name,'special_name': special_name, 'url' : proj_url, 'africa':africa, 'asia':asia, 'europe':europe, 'northamerica':northamerica,
                        'oceania':oceania, 'southamerica':southamerica, 'columns':columnize(maxMonth, maxYear)}
            
        return render(request, 'miner/latest-summary.html', context)
    except User.DoesNotExist:
        pass
    except Project.DoesNotExist:
        return HttpResponse("Failure")

@login_required
def threeMonth(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
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
        yrs = []
        for i in range(YEARS):
            yrs.append(max - i)
        yrs.reverse()
        
        
        
        
        africa = []
        asia = []
        europe = []
        oceania = []
        northamerica = []
        southamerica = []
        
        for page in pages:
            graph = Graph.objects.get(page = page, name = page.table)
            points = graph.points.all()
            maxYear = findMaxYear(points)
            maxMonth = findMaxMonthPage(page, maxYear)
            url = BASE_DIR + project.slug + "/charts/" + page.slug
            volume_vals = []
            yoy_vals = []
            yoy2_vals = []
            forecast = getForecastData(page, maxMonth)
            latest_vals = getLatestVals(page, maxYear)
            print(latest_vals)
            for year in yrs:
                yoy_vals.extend(getYoyValues(page,year))
                yoy2_vals.extend(get2YoyValues(page,year))
                if not year == maxYear:
                    volume_vals.extend(getVolumeVals(page, year))
            if page.continent.name == 'Africa':
                africa.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            elif page.continent.name == 'Asia':
                asia.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            elif page.continent.name == 'Europe':
                europe.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            elif page.continent.name == 'Oceania':
                oceania.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            elif page.continent.name == 'North America':
                northamerica.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            elif page.continent.name == 'South America':
                southamerica.append({'name': page.name, 'url': url, 'latest_vals': latest_vals, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'forecast': forecast, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
            
            #context['pages'].append({'africa':africa, 'asia':asia, 'europe':europe, 'northamerica':northamerica,
                       # 'oceania':oceania, 'southamerica':southamerica})
            context = { 'africa':africa, 'asia':asia, 'europe':europe, 'northamerica':northamerica,
                        'oceania':oceania, 'southamerica':southamerica, 'years': yrs, 'paths': {'home_url': BASE_DIR, 'project': project.name}}
        return render(request, 'miner/three-month.html', context)
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

#TODO: un-hardcode username
@login_required
def annualSummary(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        pages = project.pages.all().order_by('name')
        
        proj_array = []
        page_array = []
        maxYear = findAllMaxYear(project)
        maxMonth = findMaxMonthProject(project, maxYear)
        
        min = maxYear
        for page in pages:
            try:
                graph = Graph.objects.get(page = page, name = page.table)
                yr = findMinYear(graph.points.all())
                if yr < min:
                    min = yr
            except Graph.DoesNotExist:
                pass
        yrs = []
        for i in range((maxYear - min) + 1):
            yrs.append(maxYear - i)
        yrs.reverse()
        
        context = {'pages' : [], 'years': yrs, 'paths': {'home_url': BASE_DIR, 'project': project.name}}
        
        for page in pages:
            url = BASE_DIR + project.slug + '/charts/' + page.slug
            total_vals = []
            yoy_vals = []
            maxMonth = findMaxMonthPage(page, maxYear)
            for year in yrs:
                if year == maxYear:
                    
                    total_vals.append(getPageYTDStats(page, maxMonth, year)[-1])
                    yoy_vals.append(getPageYTDYoyStats(page, maxMonth, year)[-1])
                    # print(page.name)
                    # print(getPageYTDStats(page, maxMonth, year))
                else:
                    if getYearTotalVals(page, year) == "-":
                        total_vals.append(getYearTotalVals(page, year))
                    else:
                        total_vals.append(formatThousands(getYearTotalVals(page, year)))
                    yoy_vals.append(getYoYTotalVals(page,year))      
                    
                    
            context['pages'].append({'name': page.name, 'url': url, 'total_vals': total_vals, 'yoy_vals': yoy_vals, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})
        

        return render(request, 'miner/annual-summary.html', context)
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

@login_required
def forecast(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        pages = project.pages.all().order_by('name')
        
        proj_array = []
        proj_url = BASE_DIR + "user/" + username + "/project/" + project.slug
        page_array = []
        maxYear = findAllMaxYear(project)
        for page in project.pages.all().order_by('name'):
            maxMonth = findMaxMonthPage(page, maxYear)
            page_url = BASE_DIR + project.slug + '/charts/' + page.slug
            special_name = project.name[:-1]
            latestVals = getLatestVals(page, maxYear)
            forecastVals = getForecastData(page, maxMonth)
            page_release = getSymbolForRelease(page)
            page_data_type = getDataTypeSymbol(page.data_type)
            page_array.append({'name': page.name, 'url': page_url, 'latest': latestVals, 'forecast': forecastVals, 'data_type': page_data_type, 'release' : page_release})
        context = {'home': BASE_DIR, 'project': project.name,'special_name': special_name, 'url' : proj_url, 'pages':page_array} # 'country': countryData})
        return render(request, 'miner/forecast.html', context)
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

@login_required
def links(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    context = {}
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        pages = project.pages.all().order_by('name')
    
        africa = []
        asia = []
        europe = []
        oceania = []
        northamerica = []
        southamerica = []
    
        for page in pages:
            if page.continent.name == 'Africa':
                africa.append({'name':page.name, 'url':page.url, 'release':page.date_released})
            elif page.continent.name == 'Asia':
                asia.append({'name':page.name, 'url':page.url, 'release':page.date_released})
            elif page.continent.name == 'Europe':
                europe.append({'name':page.name, 'url':page.url, 'release':page.date_released})
            elif page.continent.name == 'Oceania':
                oceania.append({'name':page.name, 'url':page.url, 'release':page.date_released})
            elif page.continent.name == 'North America':
                northamerica.append({'name':page.name, 'url':page.url, 'release':page.date_released})
            elif page.continent.name == 'South America':
                southamerica.append({'name':page.name, 'url':page.url, 'release':page.date_released})
                    
        context = {'home': BASE_DIR, 'project': project.name, 'africa':africa, 'asia':asia,
                    'europe':europe, 'oceania':oceania, 'northamerica':northamerica, 'southamerica':southamerica}

    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    return render(request, 'miner/links.html', context)

@login_required
def forecastCompare(request, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    context = {}
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        context = {'home': BASE_DIR, 'project': project.name}
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass
    return render(request, 'miner/forecast-comparison.html', context)

#TODO: un-hardcode username
@login_required
def project(request, user_name, project_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
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
        yrs = []
        for i in range(YEARS):
            yrs.append(max - i)
        yrs.reverse()
        
        context = {'pages' : [], 'years': yrs, 'paths': {'home_url': BASE_DIR, 'project': project.name}}
        
        for page in pages:
            url = "page/" + page.slug
            volume_vals = []
            yoy_vals = []
            yoy2_vals = []
            for year in yrs:
                volume_vals.extend(getVolumeVals(page, year))
                yoy_vals.extend(getYoyValues(page,year))
                yoy2_vals.extend(get2YoyValues(page,year))
            context['pages'].append({'name': page.name, 'url': url, 'volume_vals': volume_vals, 'yoy_vals': yoy_vals, 'yoy2_vals' : yoy2_vals, 'data_type': getDataTypeSymbol(page.data_type), 'release' : getSymbolForRelease(page)})

    
        return render(request, 'miner/project-temp.html', context)
    
    except User.DoesNotExist:
        pass
    except UserProfile.DoesNotExist:
        pass
    except Project.DoesNotExist:
        pass

#TODO: un-hardcode username
@login_required
def page(request, project_name, page_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        page = Page.objects.get(project = project, slug=page_name)
        graphs = page.graphs.all().order_by('name')
        
        dir_str = project_name + '/charts'
        rel_dir = BASE_DIR + dir_str
        context = {'graphs' : [], 'paths': {'home_url': BASE_DIR, 'project':{'name': project.name, 'url': rel_dir}, 'page': page.name}}

        for graph in graphs:
            url = graph.slug
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

@login_required
def graph(request, project_name, page_name, graph_name):
    BASE_DIR = 'http://' + request.META['HTTP_HOST'] + '/'
    try:
        username = "super"
        user = User.objects.get(username = username)
        up = UserProfile.objects.get(user = user)
        project = Project.objects.get(user = up, slug = project_name)
        page = Page.objects.get(project = project, slug=page_name)
        graph = Graph.objects.get(page=page, slug=graph_name)
        
        proj_dir = BASE_DIR + project_name + '/charts/'
        page_dir = proj_dir + page_name
        context = {'paths': {'home_url': BASE_DIR, 'user': username, 'project':{'name': project.name, 'url': proj_dir}, 'page': {'name': page.name, 'url': page_dir}, 'graph': graph.name}}
        
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

def complementPoints(request):
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

            return JsonResponse(complementToJSON(graph))

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

def register(request):
    
    # A boolean value for telling the template whether the registration was successful.
    # Set to False initially. Code changes value to True when registration succeeds.
    registered = False
    
    # If it's a HTTP POST, we're interested in processing form data.
    if request.method == 'POST':
        # Attempt to grab information from the raw form information.
        # Note that we make use of both UserForm and UserProfileForm.
        user_form = UserForm(data=request.POST)
        profile_form = UserProfileForm(data=request.POST)
        
        # If the two forms are valid...
        if user_form.is_valid() and profile_form.is_valid():
            # Save the user's form data to the database.
            user = user_form.save()
            
            # Now we hash the password with the set_password method.
            # Once hashed, we can update the user object.
            user.set_password(user.password)
            user.save()
            
            # Now sort out the UserProfile instance.
            # Since we need to set the user attribute ourselves, we set commit=False.
            # This delays saving the model until we're ready to avoid integrity problems.
            profile = profile_form.save(commit=False)
            profile.user = user
        
            # Now we save the UserProfile model instance.
            profile.save()
    
            # Update our variable to tell the template registration was successful.
            registered = True
        
        # Invalid form or forms - mistakes or something else?
        # Print problems to the terminal.
        # They'll also be shown to the user.
        else:
            print user_form.errors, profile_form.errors

    # Not a HTTP POST, so we render our form using two ModelForm instances.
    # These forms will be blank, ready for user input.
    else:
        user_form = UserForm()
        profile_form = UserProfileForm()

    # Render the template depending on the context.
    return render(request,
                  'miner/register.html',
                  {'user_form': user_form, 'profile_form': profile_form, 'registered': registered} )

def user_login(request):
    
    # If the request is a HTTP POST, try to pull out the relevant information.
    if request.method == 'POST':
        # Gather the username and password provided by the user.
        # This information is obtained from the login form.
        # We use request.POST.get('<variable>') as opposed to request.POST['<variable>'],
        # because the request.POST.get('<variable>') returns None, if the value does not exist,
        # while the request.POST['<variable>'] will raise key error exception
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Use Django's machinery to attempt to see if the username/password
        # combination is valid - a User object is returned if it is.
        user = authenticate(username=username, password=password)
        
        # If we have a User object, the details are correct.
        # If None (Python's way of representing the absence of a value), no user
        # with matching credentials was found.
        if user:
            # Is the account active? It could have been disabled.
            if user.is_active:
                # If the account is valid and active, we can log the user in.
                # We'll send the user back to the homepage.
                login(request, user)
                return HttpResponseRedirect('/')
            else:
                # An inactive account was used - no logging in!
                return HttpResponse("Your Miner account is disabled.")
        else:
            # Bad login details were provided. So we can't log the user in.
            print "Invalid login details: {0}, {1}".format(username, password)
            return HttpResponse("Invalid login details supplied.")

    # The request is not a HTTP POST, so display the login form.
    # This scenario would most likely be a HTTP GET.
    else:
        # No context variables to pass to the template system, hence the
        # blank dictionary object...
        return render(request, 'miner/login.html', {})

@login_required
def user_logout(request):
    # Since we know the user is logged in, we can now just log them out.
    logout(request)
    
    # Take the user back to the homepage.
    return HttpResponseRedirect('/')

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
        points = graph.points.order_by('index')

def placeInOrder(x, y, points, graph):
    spl = x.split(" ")
    month = spl[0]
    year = int(spl[1])
    
    if points.count() == 0:
        p = Point.objects.create(index = 0, x = x, y = float(y), graph= graph)
        p.save()
        return
    
    ind = findIndex(year, month, points)
    
    for i in range(points.count()-1, ind-1, -1):
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

    while i < points.count() and int(points[i].x.split(" ")[1]) == year and mos.index(points[i].x.split(" ")[0].lower()) % 12 < mos.index(month.lower()) % 12:
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
         
def getVolumeVals(page, yr):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12
    vals = []
    recentVals = orderedFilter(points, yr)
    
    for pt in recentVals:
        if pt:
            vals.append(formatThousands(int(calculateRealValue(pt.y, graph))))
        else:
            vals.append("-")
    return vals

def getRecentValues(points):
    return orderedFilter(points, findMaxYear(points))

def getYoyValues(page, yr):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = orderedFilter(graph.points.all(), yr)
        all = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12
    vals = []
    for point in points:
        if hasattr(point, 'x'):
            p = None
            year = int(point.x.split(" ")[1]) - 1
            month = point.x.split(" ")[0]
            for pt in all:
                if year == int(pt.x.split(" ")[1]) and mos.index(month.lower()) % 12 == mos.index(pt.x.split(" ")[0].lower()) % 12:
                    p = pt
            if p and p.y != 0:
                v = round((((point.y / p.y) -1))*100, 2)
                vals.append(v)
            else:
                vals.append("-")
        else:
            vals.append("-")
            
    return vals

def get2YoyValues(page, yr):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = orderedFilter(graph.points.all(), yr)
        all = graph.points.all()
    except Graph.DoesNotExist:
        return ["-"]*12
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
                v = round(((math.sqrt(((p1.y / p2.y)*(point.y / p1.y))) - 1)*100), 2)
                
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

def findMinYear(points):
    min = 100000000
    for point in points:
        ptyr = int(point.x.split(" ")[1])
        if ptyr < min:
            min = ptyr
    return min

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
    context = {"points":[], "url": graph.url}
    
    points = graph.points.all().order_by('index')
    for point in points:
        context['points'].append([point.x, calculateRealValue(point.y, point.graph)])
    return context

def complementToJSON(graph):
    context = {"complement":[]}
    try:
        comp_graph = graph.page.graphs.get(name=graph.complement)
        comp_points = comp_graph.points.all().order_by('index')
        for point in comp_points:
            context['complement'].append([point.x, calculateRealValue(point.y, point.graph)])
    except Graph.DoesNotExist:
        pass
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
def findAverageSeasonalRatios(page):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.order_by('index')
        maxYear = findMaxYear(points)
        minYear = findMinYear(points)
        maxMonth = findMaxMonthPage(page, maxYear)
        print(page.name)
        if page.quarterly:
            totalYears = [[0 for j in range(2)] for i in range(maxYear-minYear)]
            seasonalRatios = [[0 for j in range(2)] for i in range(len(points) - ((maxMonth + 1)/3))]
            averageSeasonalRatios = [[0 for j in range(2)] for i in range(12)]
        
            for i in range(len(points)):
                if mos.index(points[i].x.split(" ")[0].lower())%12 == 2 and i+3 < len(points) and mos.index(points[i+3].x.split(" ")[0].lower())%12 == 11 and int(points[i].x.split(" ")[1]) == int(points[i+3].x.split(" ")[1]):
                    totalYears[int(math.floor(i/4))][0] = int(points[i].x.split(" ")[1])
                    totalYears[int(math.floor(i/4))][1] = points[i].y + points[i+1].y + points[i+2].y + points[i+3].y 
            
            
            for i in range(len(points)):
                for j in range(len(totalYears)):
                    if (int(points[i].x.split(" ")[1]) == totalYears[j][0]):
                        seasonalRatios[i][0] = mos.index(points[i].x.split(" ")[0].lower())%12
                        seasonalRatios[i][1] = points[i].y/totalYears[j][1]
                        
            for i in range(0,12):
                averageSeasonalRatios[i][0] = i
                monthSum = 0
                for j in range(len(seasonalRatios)):
                    if i == seasonalRatios[j][0]:
                            monthSum = monthSum + seasonalRatios[j][1]
                averageSeasonalRatios[i][1] = monthSum/len(totalYears)
        
        else:
            totalYears = [[0 for j in range(2)] for i in range((maxYear - minYear) + 1)]
            seasonalRatios = [[0 for j in range(2)] for i in range(len(points) - (11-maxMonth))]
            averageSeasonalRatios = [[0 for j in range(2)] for i in range(12)]
            
            for i in range(len(points)):
                if mos.index(points[i].x.split(" ")[0].lower())%12 == 0 and i+11 < len(points) and mos.index(points[i+11].x.split(" ")[0].lower())%12 == 11 and int(points[i].x.split(" ")[1]) == int(points[i+11].x.split(" ")[1]):
                    print(int(points[i].x.split(" ")[1]))
                    totalYears[int(math.floor(i/12))][0] = int(points[i].x.split(" ")[1])
                    totalYears[int(math.floor(i/12))][1] = points[i].y + points[i+1].y + points[i+2].y + points[i+3].y + points[i+4].y + points[i+5].y + points[i+6].y + points[i+7].y + points[i+8].y + points[i+9].y + points[i+10].y + points[i+11].y    
            
            for i in range(len(points)):
                for j in range(len(totalYears)):
                    if (int(points[i].x.split(" ")[1]) == totalYears[j][0]):
                        seasonalRatios[i][0] = mos.index(points[i].x.split(" ")[0].lower())%12
                        seasonalRatios[i][1] = points[i].y/totalYears[j][1]
                        
            for i in range(0,12):
                averageSeasonalRatios[i][0] = i
                monthSum = 0
                for j in range(len(seasonalRatios)):
                    if i == seasonalRatios[j][0]:
                        monthSum = monthSum + seasonalRatios[j][1]
                averageSeasonalRatios[i][1] = monthSum/len(totalYears)
        
    except Graph.DoesNotExist:
            pass
    
    return averageSeasonalRatios

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

def findMaxMonthProject(project, year):
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

def findMaxMonthPage(page, year):
    max = 0
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

def findMinMonthPage(page, year):
    min = 13
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = filterYear(graph.points.all(), year)
        for point in points:
            mi = mos.index(point.x.split(" ")[0].lower()) % 12
            if mi < min:
                min = mi
                
    except Graph.DoesNotExist:
        pass
    
    return min
        



def columnize(monthIndex, year):
    columns = []
    for i in range(MONTHS):
        month = mos[(monthIndex - i)%12]
        columns.append(month.capitalize() + " " + str(year))
    columns.reverse()
    return columns

def getPageMthStats(page, month, year):
    vals = []
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
        for i in range(MONTHS):
            if month - i < 0:
                vals.append(monthData((month-i)%12, year-1, points))
            else:
                vals.append(monthData((month-i)%12, year, points))
    except Graph.DoesNotExist:
        vals = ["-"]*MONTHS
    vals.reverse()
    return vals

def getPageYTDStats(page, month, year):
    vals = []
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        for i in range(MONTHS):
            if month - i < 0:
                vals.append(formatThousands(int(monthYTD((month-i)%12, year-1, graph.points.all()))))
            else:
                vals.append(formatThousands(int(monthYTD((month-i)%12, year, graph.points.all()))))
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
                vals.append(monthYTDYoY((month-i)%12, year-1, graph.points.all()))
            else:
                vals.append(monthYTDYoY((month-i)%12, year, graph.points.all()))
    
    except Graph.DoesNotExist:
        vals = ["-"]*MONTHS
    vals.reverse()
    return vals

def getPageMthYoyStats(page, month, year):
    vals = []
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
        for i in range(MONTHS):
            if month - i < 0:
                vals.append(monthYoYData((month-i)%12, year-1, points))
            else:
                vals.append(monthYoYData((month-i)%12, year, points))
    except Graph.DoesNotExist:
        vals = ["-"]*MONTHS
    vals.reverse()
    return vals

def monthYTD(month, year, pointList):
    points = filterYear(pointList, year)
    sum = 0
    j = 0
    for i in range(month%12):
        for point in points:
            if i == mos.index(point.x.split(" ")[0].lower())%12:
                sum += calculateRealValue(point.y , point.graph)
    for point in points:
        if month%12 == mos.index(point.x.split(" ")[0].lower())%12:
            return sum + calculateRealValue(point.y , point.graph)
    return 0

def monthYTDYoY(month, year, points):
    num = monthYTD(month, year, points)
    denom = monthYTD(month, year-1, points)
    if num == 0 or denom == 0:
        return "-"
    return round((num/denom)*100 - 100,2)

def monthYoYData(month, year, pointList):
    points = filterYear(pointList, year)
    for point in points:
        if month == mos.index(point.x.split(" ")[0].lower())%12:
            if hasattr(point, 'x'):
                prevYear = year - 1
                for pt in pointList:
                    if prevYear == int(pt.x.split(" ")[1]) and month == mos.index(pt.x.split(" ")[0].lower()) % 12:
                            v = round(((point.y / pt.y) * 100) - 100, 2)
                            return v
    return '-'

def monthData(month, year, pointList):
    points = filterYear(pointList, year)
    for point in points:
        if month == mos.index(point.x.split(" ")[0].lower())%12:
            return formatThousands(int(calculateRealValue(point.y, point.graph)))
    return '-'           

        
        
def getForecastData(page, month):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.order_by('index')
        maxYear = findMaxYear(points)
        minYear = findMinYear(points)
        pts = filterYear(points, maxYear)
        totalYears = []
        seasonalRatios = []
        vals = []
        # print(page.name)
        if page.name == "Aeroflot" or page.name == "Iberia" or page.name == "WizzAir":
            for i in range(0, 11-month):
                vals.append("-")
            return vals
        averageSeasonalRatios = findAverageSeasonalRatios(page)
        
        finalData = []
        YTD_current = getPageYTDStats(page, month, maxYear)
        # print(YTD_current)
        if maxYear - 1 >= minYear:
            YTD_prev = getPageYTDStats(page, month, maxYear-1)
            # print(YTD_prev)
            # print(int(YTD_current[-1].replace(',','')))
            # print(int(YTD_prev[-1].replace(',','')))
            a = int(YTD_current[-1].replace(',',''))
            b = int(YTD_prev[-1].replace(',',''))
            x = float(a)/b
            # print(x)
            if page.quarterly:
                sum_3mth_pres = points[len(points)-1].y
                sum_3mth_prev = points[len(points)-5].y
                
            else:
                sum_3mth_pres = points[len(points)-1].y + points[len(points)-2].y + points[len(points)-3].y
                sum_3mth_prev = points[len(points)-13].y + points[len(points)-14].y + points[len(points)-15].y
            y = sum_3mth_pres/sum_3mth_prev
            # print(sum_3mth_pres)
            # print(sum_3mth_prev)
            # print(y)
            if page.quarterly:
                sum_12mth_pres = points[len(points)-1].y + points[len(points)-2].y + points[len(points)-3].y + points[len(points)-4].y
                sum_12mth_prev = points[len(points)-5].y + points[len(points)-6].y + points[len(points)-7].y + points[len(points)-8].y
            else:
                sum_12mth_pres = points[len(points)-1].y + points[len(points)-2].y + points[len(points)-3].y + points[len(points)-4].y + points[len(points)-5].y + points[len(points)-6].y + points[len(points)-7].y + points[len(points)-8].y + points[len(points)-9].y + points[len(points)-10].y + points[len(points)-11].y + points[len(points)-12].y
                sum_12mth_prev = points[len(points)-13].y + points[len(points)-14].y + points[len(points)-15].y + points[len(points)-16].y + points[len(points)-17].y + points[len(points)-18].y + points[len(points)-19].y + points[len(points)-20].y + points[len(points)-21].y + points[len(points)-22].y +  points[len(points)-23].y + points[len(points)-24].y
            z = sum_12mth_pres/sum_12mth_prev
            # print(sum_12mth_pres)
            # print(sum_12mth_prev)
            # print(z)
            avg = (((x-1)*100) + ((y-1)*100) + ((z-1)*100))/3
            # print(avg)
            # print(getYearTotalVals(page, maxYear -1))
            yr_frcst = getYearTotalVals(page, maxYear -1)*((avg/100)+1)
            # print(yr_frcst)
            remaining_pass = yr_frcst - int(YTD_current[-1].replace(',',''))
            # print(remaining_pass)
            
            
            
            
            # print(findAverageSeasonalRatios(page))
            sum_avg_seas = 0
            for i in range(month+1, 12):
                # print(averageSeasonalRatios[i][1])
                sum_avg_seas = sum_avg_seas + (averageSeasonalRatios[i][1])*100
                # print(sum_avg_seas)
            for i in range(month+1, 12):
                # print(((averageSeasonalRatios[i][1])*100)/sum_avg_seas)
                if (((averageSeasonalRatios[i][1])*100)/sum_avg_seas)*remaining_pass == 0:
                    vals.append("-")
                else:
                    vals.append(formatThousands(int((((averageSeasonalRatios[i][1])*100)/sum_avg_seas)*remaining_pass)))
                # print(vals)
                # 
        # print(vals)
        return vals   
            
    except Graph.DoesNotExist:
        vals = ["-"]*11
    
              
            
def getLatestVals(page, year):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
        maxMonth = findMaxMonthPage(page, year)
        minMonth = findMinMonthPage(page, year)
        pts = filterYear(points, year)
        data = [[0 for j in range(1)] for i in range(maxMonth + 1)]
        totalYears = []
        
        
        if not pts:
            data = ["-"]*12
            
        elif pts:
            if page.quarterly:
                
                for pt in pts:
                    data[mos.index(pt.x.split(" ")[0].lower())%12] = (formatThousands(int(calculateRealValue(pt.y, graph))))
                
                if minMonth == 2:
                    if maxMonth == 11:
                        for i in range(minMonth+1, minMonth+3):
                            data[i] = "-"
                        for i in range(minMonth+4, minMonth+6):
                            data[i] = "-"
                        for i in range(minMonth+7, minMonth+9):
                            data[i] = "-"
                    if maxMonth == 8:
                        for i in range(minMonth+1, minMonth+3):
                            data[i] = "-"
                        for i in range(minMonth+4, minMonth+6):
                            data[i] = "-"
                    if maxMonth == 5:
                        for i in range(minMonth+1, minMonth+3):
                            data[i] = "-"
                            
                if minMonth == 5:
                        if maxMonth == 11:
                            for i in range(minMonth+1, minMonth+3):
                                data[i] = "-"
                            for i in range(minMonth+4, minMonth+6):
                                data[i] = "-"
                        if maxMonth == 8:
                            for i in range(minMonth+1, minMonth+3):
                                data[i] = "-"
                if minMonth == 8:
                    if maxMonth == 11:
                            for i in range(minMonth+1, minMonth+3):
                                data[i] = "-"

            elif page.annualy:
                
                for pt in pts:
                   data[mos.index(pt.x.split(" ")[0].lower())%12] = (formatThousands(int(calculateRealValue(pt.y, graph))))
            
            else:
                
                for pt in pts:
                    data[mos.index(pt.x.split(" ")[0].lower())%12] = (formatThousands(int(calculateRealValue(pt.y, graph))))
            
            if not minMonth == 0:
                for i in range(0, minMonth):
                    data[i] = "-"
                # print(data)
            
            
                    
                
            

        else:
            data = ["-"]*12
        
        if not pts:
            data = ["-"]*12
        
            
        return data
            
    except Graph.DoesNotExist:        
        data = ["-"]*12
    
def getYearTotalVals(page, year):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
        maxYear = findMaxYear(points)
        minYear = findMinYear(points)
        pts = filterYear(points, year)
        
        if year < minYear:
            return "-"
        
        else:
            if len(pts) == 12:
                yearTotal = 0
                for pt in pts:
                    yearTotal = yearTotal + int(calculateRealValue(pt.y, graph))
            
                return yearTotal
            elif len(pts) == 4:
                yearTotal = 0
                for pt in pts:
                    yearTotal = yearTotal + int(calculateRealValue(pt.y, graph))
                    
                return yearTotal
                
                
        
            else:
                return "-"
            
            
    
    except Graph.DoesNotExist:        
        return "-"
        
def getYoYTotalVals(page, year):
    try:
        graph = Graph.objects.get(page = page, name = page.table)
        points = graph.points.all()
        maxYear = findMaxYear(points)
        minYear = findMinYear(points)
        
        if year <= minYear:
            return "-"
        else:
          currentYearTotal = getYearTotalVals(page, year)
          previousYearTotal = getYearTotalVals(page, year-1)
          
        if previousYearTotal == 0 or type(previousYearTotal) == type(" ") or type(currentYearTotal) == type(" "):
            return "-"
        
        else:
            return round(((float(currentYearTotal) / previousYearTotal) - 1) * 100, 2)
    
    except Graph.DoesNotExist:        
        return "-"

#----------------------------------------------------

def countryTotals(project):
    allCountries = []
    allCountriesWithComputedTotals = []
    pages = project.pages.all()
    for page in pages:
        countryName = page.country
        allAiportsPerCountry = filter(lambda x: x.country == countryName, pages)
        if not allAiportsPerCountry in allCountries:
            allCountries.append(allAiportsPerCountry)
    for countryAirports in allCountries:
        countryAirports.sort(countryAirports, key=lambda x: Graph.objects.get(page = x, name = x.table).points.all().len())
        countryTotal = countryAiports[0].Graph.objects.get(page = countryAirports[0], name = countryAirports[0].table).points.all()
        for airport in countryAirports.remove[0]:
            graph = Graph.objects.get(page = airport, name = airport.table)
            points = graph.points.all()
            for i in range(points.length):
                if countryTotal[i][0] == points[i][0]:
                    countryTotal[i][1] == countryTotal[i][1] + points[i][1]
        allCountriesWithComputedTotals.append(countryTotal)
    return allCountriesWithComputedTotals
                
  
        
        
            
        
        

    
    