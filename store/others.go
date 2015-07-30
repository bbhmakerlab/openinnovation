package store

import (
	"net/http"
	"time"

	"bbhoi.com/response"
)

//////////////////////
// Featured Project //
//////////////////////

const (
	createFeaturedProjectSQL = `
	project_id int NOT NULL,
	created_at timestamp NOT NULL`
)

type FeaturedProject struct {
	ProjectID	int64		`json:"id,omitempty"`
	CreatedAt	time.Time	`json:"createdAt,omitempty"`
}

func FeaturedProjects(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	const rawSQL = `SELECT project.* FROM featured_project
	                INNER JOIN project ON project.id = featured_project.project_id
					LIMIT $1`

	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := queryProjects(rawSQL, count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}
