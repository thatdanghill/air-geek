function SetUpManager() {
	this.projectManager = new ProjectManager();
	this.pageManager = new PageManager();
	this.graphManager = new GraphManager();
}

SetUpManager.prototype = {
	constructor: SetUpManager,
	setUp: function() {

	}
}

function User(name, projects) {
	this.name = name;
	this.projects = projects;
}

User.prototype = {
	constructor: User,
}

function Project(name, user, pages) {
	this.name = name;
	this.user = user;
	this.pages = pages;
}

Project.prototype = {
	constructor: Project,
}

function Page(name, project, graphs) {
	this.name = name;
	this.project = project;
	this.graphs = graphs;
}

Page.prototype = {
	constructor: Page,
}

function Graph(name, page, points) {
	this.name = name,
	this.page = page;
	this.points = points;
}

Graph.prototype = {
	constructor: Graph,
}

function Point(index, x, y, graph) {
	this.index = index;
	this.x = x;
	this.y = y;
	this.graph = graph;
}

Point.prototype = {
	constructor: Point,
}