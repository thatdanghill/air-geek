from django.conf.urls import patterns, include, url
from django.contrib import admin
from miner import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'air_geek.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^user/(?P<user_name>[\w\-]+)/project/(?P<project_name>[\w\-]+)/page/(?P<page_name>[\w\-]+)/graph/(?P<graph_name>[\w\-]+)/$', views.graph, name='graph'),
    url(r'^user/$', views.user, name='user')
)
