import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'air_geek.settings')

import django
django.setup()
from miner.models import Project, Page, Graph, Continent

Continent.objects.get_or_create(name = "Africa")
Continent.objects.get_or_create(name = "Antarctica")
Continent.objects.get_or_create(name = "South America")
Continent.objects.get_or_create(name = "North America")
Continent.objects.get_or_create(name = "Europe")
Continent.objects.get_or_create(name = "Oceania")
Continent.objects.get_or_create(name = "Asia")

airline = Project.objects.get(name="Airlines")
airport = Project.objects.get(name="Airports")

a = airline.pages.get(name="JetBlue")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="CopaAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="WestJet")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="AlaskaAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="IcelandAir")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="SouthWestAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="WizzAir")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="ChinaAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="ThaiAirways")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="KoreanAir")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="HainanAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="VirginAustrailia")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="AmericanAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="JapanAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="AegeanAirlines")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="AirAsia")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="AirCanada")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="AirNewZealand")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="ANA")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="BritishAirways")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="CathayPacific")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="ChinaSouthern")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Delta")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="EasyJet")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="EVAAir")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Garuda")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="IAG")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Iberia")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Lufthansa")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="NorwegianAir")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Scandinavian Airlines")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Singapore Airlines")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="Turkish Airlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Vueling")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Finnair")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="LATAM Airlines")
a.continent = Continent.objects.get(name="South America")
a.save()

a = airline.pages.get(name="AirChina")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="AirBerlin")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Avianca")
a.continent = Continent.objects.get(name="South America")
a.save()

a = airline.pages.get(name="ChinaEastern")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="AsianaAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Qantas")
a.continent = Continent.objects.get(name="Oceania")
a.save()

a = airline.pages.get(name="VirginAmerica")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="BangkokAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="AirFrance-KLM")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="JetAirways")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="UnitedAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="Aeroflot")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="TransaeroAirlines")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Alitalia")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="AerLingus")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="Kulula")
a.continent = Continent.objects.get(name="Africa")
a.save()

a = airline.pages.get(name="TAPPortugal")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="ThomsonAirways")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airline.pages.get(name="AirTransat")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="KenyaAirways")
a.continent = Continent.objects.get(name="Africa")
a.save()

a = airline.pages.get(name="USAirways")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="RoyalJordanianAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="FlyBE")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="SpringAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="SpiritAirlines")
a.continent = Continent.objects.get(name="North America")
a.save()

a = airline.pages.get(name="PAL")
a.continent = Continent.objects.get(name="South America")
a.save()

a = airline.pages.get(name="AirArabia")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="ShandongAirlines")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Emirates")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="Qatar")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airline.pages.get(name="RyanAir")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Madrid-Barajas")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Barcelona-El-Prat")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Gran-Canaria")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Tenerife-Sur")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Palma-de-Mallorca")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Malaga")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Lanzarote")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Alicante-Elche")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Fuerteventura")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Tenerife-Norte")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Bilbao")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Valencia")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Sevilla")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Ibiza")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Heathrow")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Southampton")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Edinburgh")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Gatwick")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Glasgow")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Aberdeen")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Manchester")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Stansted")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Paris-Charles-de-Gaulle")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Paris-Orly")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Dubai")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airport.pages.get(name="Frankfurt")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Ataturk")
a.continent = Continent.objects.get(name="Asia")
a.save()

a = airport.pages.get(name="Rome")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Munich")
a.continent = Continent.objects.get(name="Europe")
a.save()

a = airport.pages.get(name="Beijing")
a.continent = Continent.objects.get(name="Asia")
a.save()