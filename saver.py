from miner.models import Project, Page, Graph

for project in Project.objects.all():
    project.save()

for page in Page.objects.all():
    page.save()

for graph in Graph.objects.all():
    graph.save()