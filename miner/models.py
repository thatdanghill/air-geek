from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    def __unicode__(self):
        return self.user.username

class Project(models.Model):
    user = models.ForeignKey(UserProfile)
    name = models.CharField(max_length=128)

    def __unicode__(self):
        return self.user.__unicode__() + ": " + self.name

class Page(models.Model):
    name = models.CharField(max_length=128)
    project = models.ForeignKey(Project)

    def __unicode__(self):
        return self.project.__unicode__() + ": " + self.name

class Graph(models.Model):
    name = models.CharField(max_length=128)
    page = models.ForeignKey(Page)
    length = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

class Point(models.Model):
    index = models.IntegerField(unique=True)
    x = models.CharField(max_length = 40)
    y = models.FloatField()
    graph = models.ForeignKey(Graph)

    def __unicode__(self):
        return "(" + self.x + "," + str(self.y) + ")"


