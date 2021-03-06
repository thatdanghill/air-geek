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
    url(r'^plugin/user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/page/(?P<page_name>[\w\-]+)/graph/(?P<graph_name>[\w\-]+)/$', views.pluginGraph, name='plugin graph'),
    url(r'^plugin/user/$', views.pluginUser, name='plugin user'),
    url(r'^user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/$', views.project, name='project'),
    url(r'^user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/page/(?P<page_name>[\w\-]+)/$', views.page, name='page'),
    url(r'^user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/page/(?P<page_name>[\w\-]+)/graph/(?P<graph_name>[\w\-]+)/$', views.graph, name='graph'),
    url(r'^all_points/$', views.allPoints, name='all_points')
)

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
