var Project = React.createClass({displayName: "Project",
	mixins: [ State, Navigation ],
	getInitialState: function() {
		return {project: null};
	},
	componentDidMount: function() {
		OI.project({
			projectID: this.getParams().projectID,
		});

		dispatcher.register(function(payload) {
			switch (payload.type) {
			case "projectDone":
				this.setState({project: payload.data.data});
				break;
			case "projectFail":
				this.transitionTo("dashboard");
				break;
			case "newTaskDone":
			case "updateTaskDone":
			case "deleteTaskDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				OI.getProjectTasks({projectID: project.id});
				break;
			case "newTaskFail":
				Materialize.toast("Failed to create new task!", 3000, "red white-text");
				break;
			case "deleteTaskFail":
				Materialize.toast("Failed to delete existing task!", 3000, "red white-text");
				break;
			case "getProjectTasksDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				project.tasks = payload.data.data;
				this.setState({project: project});
				break;
			}
		}.bind(this));
	},
	render: function() {
		var project = this.state.project;
		if (!project) {
			return React.createElement("div", null)
		}
		return (
			React.createElement("main", {className: "project"}, 
				React.createElement(Project.Cover, {project: project}), 
				React.createElement(Project.Content, {project: project})
			)
		)
	},
});

Project.Cover = React.createClass({displayName: "Cover",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.parallax)).parallax();
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "parallax-container"}, 
				React.createElement("div", {ref: "parallax", className: "parallax"}, 
					React.createElement("img", {src: project.imageURL})
				), 
				React.createElement("div", {className: "parallax-overlay valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement(Project.Cover.Title, {project: project}), 
						React.createElement("h4", {className: "text-center"}, project.tagline)
					)
				)
			)
		)
	},
});

Project.Cover.Title = React.createClass({displayName: "Title",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.title));
	},
	render: function() {
		var project = this.props.project;
		return React.createElement("h1", {className: "text-center"}, project.title)
	},
});

Project.Content = React.createClass({displayName: "Content",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.tabs)).tabs();
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "row container"}, 
				React.createElement("div", {className: "col s12"}, 
					React.createElement("ul", {className: "tabs", ref: "tabs"}, 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-overview"}, "Overview")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-tasks"}, "Tasks")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-milestones"}, "Milestones")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-members"}, "Members"))
					)
				), 
				React.createElement(Project.Overview, {project: project}), 
				React.createElement(Project.Tasks, {project: project}), 
				React.createElement(Project.Milestones, {project: project}), 
				React.createElement(Project.Members, {project: project})
			)
		)
	},
});

Project.Overview = React.createClass({displayName: "Overview",
	getInitialState: function() {
		return {editMode: false};
	},
	render: function() {
		var project = this.props.project;
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {id: "project-overview", className: "col s12"}, 
				React.createElement("div", {className: "main col s12 m8 l9"}, 
					React.createElement("div", {className: classNames("card", editMode && "blue white-text")}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h5", null, "Description", 
								React.createElement("a", {href: "#", onClick: this.handleClick}, 
									React.createElement("i", {className: classNames("material-icons right", editMode && "white-text")}, 
										editMode ? "done" : "mode edit"
									)
								)
							), 
							this.descriptionElement()
						)
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Next Deadline")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "59"), 
							React.createElement("p", null, "days left")
						)
					)
				)
			)
		)
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		if (editMode) {
			var description = React.findDOMNode(this.refs.description).innerHTML;
			OI.updateProject({
				projectID: this.props.project.id,
				description: description,
			});
		}
		this.setState({editMode: !editMode});
	
		e.preventDefault();
	},
	descriptionElement: function() {
		if (this.state.editMode) {
			return React.createElement("p", {className: "no-outline", ref: "description", contentEditable: true}, this.props.project.description)
		}
		return React.createElement("p", {ref: "description"}, this.props.project.description)
	},
});

Project.Milestones = React.createClass({displayName: "Milestones",
	componentDidMount: function() {
		var timelineBlocks = $('.cd-timeline-block'),
			offset = 0.8;

		//hide timeline blocks which are outside the viewport
		hideBlocks(timelineBlocks, offset);

		//on scolling, show/animate timeline blocks when enter the viewport
		$(window).on('scroll', function(){
			(!window.requestAnimationFrame) 
			? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
			: window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
		});

		function hideBlocks(blocks, offset) {
			blocks.each(function() {
				( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
			});
		}

		function showBlocks(blocks, offset) {
			blocks.each(function(){
				( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
			});
		}
	},
	render: function() {
		return (
			React.createElement("div", {id: "project-milestones", className: "col s12"}, 
				React.createElement("section", {id: "cd-timeline", className: "cd-container"}, 
					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-picture"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-picture.svg", alt: "Picture"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 1"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 14")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 2"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde?"), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 18")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-picture"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-picture.svg", alt: "Picture"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 3"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, obcaecati, quisquam id molestias eaque asperiores voluptatibus cupiditate error assumenda delectus odit similique earum voluptatem doloremque dolorem ipsam quae rerum quis. Odit, itaque, deserunt corporis vero ipsum nisi eius odio natus ullam provident pariatur temporibus quia eos repellat consequuntur perferendis enim amet quae quasi repudiandae sed quod veniam dolore possimus rem voluptatum eveniet eligendi quis fugiat aliquam sunt similique aut adipisci."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 24")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-location"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-location.svg", alt: "Location"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 4"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Feb 14")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-location"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-location.svg", alt: "Location"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 5"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Feb 18")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Final Section"), 
							React.createElement("p", null, "This is the content of the last section"), 
							React.createElement("span", {className: "cd-date"}, "Feb 26")
						)
					)
				)
			)
		)
	},
});