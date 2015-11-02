from django.conf.urls import patterns, include, url
from django.contrib import admin
from miner import views
from django.conf import settings # New Import
from django.conf.urls.static import static # New Import

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'air_geek.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'$^', views.index, name="Air Geek"),
    url(r'^(?P<project_name>[\w\-]+)/latest-summary/$', views.latestSummary, name="Latest Summary"),
    url(r'^(?P<project_name>[\w\-]+)/charts/$', views.charts, name="Charts"),
    url(r'^(?P<project_name>[\w\-]+)/three-month/$', views.threeMonth, name="Three Month Data"),
    url(r'^(?P<project_name>[\w\-]+)/annual-summary/$', views.annualSummary, name="Annual Summary"),
    url(r'^(?P<project_name>[\w\-]+)/forecast/$', views.forecast, name="Forecast"),
    url(r'^(?P<project_name>[\w\-]+)/links/$', views.links, name="Links"),
    url(r'^(?P<project_name>[\w\-]+)/forecast-comparison/$', views.forecastCompare, name="Forecast Comparison"),
    url(r'^plugin/user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/page/(?P<page_name>[\w\-]+)/graph/(?P<graph_name>[\w\-]+)/$', views.pluginGraph, name='plugin graph'),
    url(r'^plugin/user/$', views.pluginUser, name='plugin user'),
    url(r'^user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/$', views.project, name='project'),
    url(r'^(?P<project_name>[\w\-]+)/charts/(?P<page_name>[\w\-]+)/$', views.page, name='page'),
    url(r'^(?P<project_name>[\w\-]+)/charts/(?P<page_name>[\w\-]+)/(?P<graph_name>[\w\-]+)/$', views.graph, name='graph'),
    url(r'^all_points/$', views.allPoints, name='all_points'),
    url(r'^complement_points/$', views.complementPoints, name='complement_points'),
    url(r'^miner/register/$', views.register, name='register'),
    url(r'^login/$', views.user_login, name='login'),
    url(r'^logout/$', views.user_logout, name='logout'),
)

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
