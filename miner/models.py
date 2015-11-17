from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    def __unicode__(self):
        return self.user.username

class Continent(models.Model):
    name = models.CharField(max_length = 40)
    
    def __unicode__(self):
        return self.name

class Project(models.Model):
    user = models.ForeignKey(UserProfile, related_name='projects')
    name = models.CharField(max_length=128, unique=True)
    slug = models.SlugField()
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Project, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.user.__unicode__() + ": " + self.name

class Page(models.Model):
    name = models.CharField(max_length=128)
    project = models.ForeignKey(Project, related_name='pages')
    slug = models.SlugField()
    table = models.CharField(max_length=128)
    data_type = models.CharField(max_length=128)
    quarterly = models.BooleanField(default=False)
    annualy = models.BooleanField(default=False)
    continent = models.ForeignKey(Continent, related_name='pages')
    url = models.URLField(default="http://google.com/")
    date_released = models.CharField(max_length=128, default='')
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Page, self).save(*args, **kwargs)
    
    def __unicode__(self):
        return self.project.__unicode__() + ": " + self.name

class Graph(models.Model):
    name = models.CharField(max_length=128)
    page = models.ForeignKey(Page, related_name='graphs')
    slug = models.SlugField()
    url = models.URLField(default="http://google.com/")
    complement = models.CharField(max_length=128)
    thousand = models.BooleanField(default=False)
    million = models.BooleanField(default=False)
    billion = models.BooleanField(default=False)
    
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Graph, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.page.__unicode__() + ": " + self.name

class Point(models.Model):
    index = models.IntegerField()
    x = models.CharField(max_length = 40)
    y = models.FloatField()
    graph = models.ForeignKey(Graph, related_name='points')

    def __unicode__(self):
        return self.graph.__unicode__() + ": (" + self.x + "," + str(self.y) + ")"