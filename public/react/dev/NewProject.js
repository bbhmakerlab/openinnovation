var NewProject = React.createClass({
	render: function() {
		return (
			<div className="new-project">
				<Header />
				<main>
					<NewProject.Cover />
					<NewProject.Form />
				</main>
				<Footer />
			</div>
		)
	},
});

NewProject.Cover = React.createClass({
	componentDidMount: function() {
		var dropzone = React.findDOMNode(this);
		$(dropzone).dropzone({
            url: "/foo",
            clickable: true,
            maxFilesize: 1,
            autoProcessQueue: false,
            dictDefaultMessage: "Select your project cover (max: 1MB)",
            addedfile: function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
					dispatcher.dispatch({
						type: "new-project-image-file",
						file: file,
					});
					console.log("test");
                    dropzone.style.background = "url(" + e.target.result + ") center / cover";
                }.bind(this);
                reader.readAsDataURL(file);
            }.bind(this),
		});
	},
	render: function() {
		return (
			<div className="parallax-container">
				<div ref="parallax" className="parallax">
					<img src="images/1.jpg" />
				</div>
				<div className="parallax-overlay valign-wrapper">
					<div className="valign">
						<h1>Upload a representative image</h1>
						<h4>It can be changed at later time</h4>
					</div>
				</div>
			</div>
		)
	},
});

NewProject.Form = React.createClass({
	image: null,
	getInitialState: function() {
		return {showOther: false};
	},
	componentDidMount: function() {
		dispatcher.register(function(payload) {
			if (payload.type === "new-project-image-file") {
				this.image = payload.file;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		this.image = null;
	},
	render: function() {
		return (
			<div className="row container">
				<form ref="form" className="col s8 offset-s2" onSubmit={this.handleSubmit}>
					<div className="row">
						<div className="input-field col s12">
							<input type="text" name="project-title" id="project-title" className="validate" />
							<label htmlFor="project-title">Name</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s12">
							<input type="text" name="project-tagline" id="project-tagline" className="validate" />
							<label htmlFor="project-tagline">Tagline</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s12">
							<textarea id="project-description" name="project-description" className="materialize-textarea"></textarea>
							<label htmlFor="project-description">Description</label>
						</div>
					</div>
					<div className="row">
						<div className="col s12">
							<label>Type</label>
							<select onChange={this.onProjectTypeChanged} name="project-type" className="browser-default" defaultValue="">
								<option value="" disabled>What's the project type?</option>
								<option value="advertisement">Advertisement</option>
								<option value="installation">Installation</option>
								<option value="tvcommercial">TV Commercial</option>
								<option value="website">Website</option>
								<option value="other">Other</option>
							</select>
							{
								this.state.showOther ?  <input type="text" id="project-type-other" /> : ""
							}
						</div>
					</div>
					<button type="submit" className="waves-effect waves-light btn">Submit</button>
				</form>
			</div>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		if (!this.image) {
			Materialize.toast("Image was not selected!");
			return;
		}

		var form = React.findDOMNode(this.refs.form);
		var title = form.elements["project-title"].value;
		var tagline = form.elements["project-tagline"].value;
		var description = form.elements["project-description"].value;
		if (title.length <= 1) {
			Materialize.toast("Title is too short!");
			return;
		} else if (tagline.length <= 5) {
			Materialize.toast("Tagline is too short!");
			return;
		} else if (description.length <= 20) {
			Materialize.toast("Description is too short!");
			return;
		}

		var fd = new FormData();
		fd.append("image", this.image);
		fd.append("title", title);
		fd.append("tagline", tagline);
		fd.append("description", description);

		OI.project(fd, "POST");
	},
	onProjectTypeChanged: function(e) {
		if (e.target.value == "other") {
			this.setState({showOther: true});
		} else {
			this.setState({showOther: false});
		}
	},
});
