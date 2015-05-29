import sys, getopt
import xlsxwriter
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from miner.models import UserProfile, Project, Page, Graph, Point

def makeTable():
    try:
        user = User.objects.get(username = 'super')
        userprofile = UserProfile.objects.get(user = user)
        project_name = sys.argv[1]
        project = Project.objects.get(user=userprofile, name=project_name)
        page_name = sys.argv[2]
        page = Page.objects.get(project = project, name = page_name)
        graph_name = sys.argv[3]
        graph = Graph.objects.get(page = page, name = graph_name)
        points = graph.points.all()
        
        str = project_name + "-" + page_name + "-" + graph_name + "-table.xlsx"
        workbook = xlsxwriter.Workbook(str)
        worksheet = workbook.add_worksheet()
        
        tablify(points, worksheet)
        workbook.close()
    
    except User.DoesNotExist:
        print("User is not valid")
    except UserProfile.DoesNotExist:
        print("UserProfile is not valid")
    except getopt.GetoptError:
        print("Script requires 3 arguments: project name, page name, and graph name")
        sys.exit(2)
    except Project.DoesNotExist:
        print("Project does not exist!")
    except Page.DoesNotExist:
        print("Page does not exist!")
    except Graph.DoesNotExist:
        print("Graph does not exist!")

def tablify(points, worksheet):
    mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    setupMonths(worksheet)
    yeararray = setColumns(points, worksheet)
    for point in points:
        month = point.x.split(" ")[0]
        year = int(point.x.split(" ")[1])
        row = mos.index(month.lower()) % 12 + 1
        col = yeararray.index(year) + 1
        worksheet.write(row, col, point.y)


def setupMonths(worksheet):
    worksheet.write('A2', 'January')
    worksheet.write('A3', 'February')
    worksheet.write('A4', 'March')
    worksheet.write('A5', 'April')
    worksheet.write('A6', 'May')
    worksheet.write('A7', 'June')
    worksheet.write('A8', 'July')
    worksheet.write('A9', 'August')
    worksheet.write('A10', 'September')
    worksheet.write('A11', 'October')
    worksheet.write('A12', 'November')
    worksheet.write('A13', 'December')

def setColumns(points, worksheet):
    array = []
    ya = []
    for point in points:
        year = int(point.x.split(" ")[1])
        array.append(year)
    array.sort()
    j = 1
    worksheet.write(0, j, array[0])
    ya.append(array[0])
    for i in range(1, len(array)):
        if array[i] != array[i-1]:
            j += 1
            worksheet.write(0, j, array[i])
            ya.append(array[i])
    return ya

if __name__ == '__main__':
    makeTable()