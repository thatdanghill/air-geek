from django.contrib import admin
from miner.models import UserProfile, Project, Page, Graph, Point

def divide_by_k(modeladmin, request, queryset):
    for point in queryset:
        point.y = point.y / 1000
        point.save()
divide_by_k.short_description = "Divide point abscissae by one thousand"

def divide_by_m(modeladmin, request, queryset):
    for point in queryset:
        point.y = point.y / 1000000
        point.save()
divide_by_m.short_description = "Divide point abscissae by one million"

def divide_by_b(modeladmin, request, queryset):
    for point in queryset:
        point.y = point.y / 1000000000
        point.save()
divide_by_b.short_description = "Divide point abscissae by one billion"

class PointAdmin(admin.ModelAdmin):
    ordering = ['graph', 'index']
    actions = [divide_by_k, divide_by_m, divide_by_b]

class GraphAdmin(admin.ModelAdmin):
    ordering = ['page', 'name']

class PageAdmin(admin.ModelAdmin):
    ordering = ['project', 'name']

class ProjectAdmin(admin.ModelAdmin):
    ordering = ['name']

admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Page, PageAdmin)
admin.site.register(Graph, GraphAdmin)
admin.site.register(Point, PointAdmin)
