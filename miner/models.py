from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    def __unicode__(self):
        return self.user.username

class Project(models.Model):
    user = models.ForeignKey(UserProfile, related_name='projects')
    name = models.CharField(max_length=128)

    def __unicode__(self):
        return self.user.__unicode__() + ": " + self.name

class Page(models.Model):
    name = models.CharField(max_length=128)
    project = models.ForeignKey(Project, related_name='pages')

    def __unicode__(self):
        return self.project.__unicode__() + ": " + self.name

class Graph(models.Model):
    name = models.CharField(max_length=128)
    page = models.ForeignKey(Page, related_name='graphs')

    def __unicode__(self):
        return self.page.__unicode__() + ": " + self.name

class Point(models.Model):
    index = models.IntegerField()
    x = models.CharField(max_length = 40)
    y = models.FloatField()
    graph = models.ForeignKey(Graph, related_name='points')

    def __unicode__(self):
        return self.graph.__unicode__() + ": (" + self.x + "," + str(self.y) + ")"


