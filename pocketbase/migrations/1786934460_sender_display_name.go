package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `[
			{
				"id": "pbc_3367978789",
				"name": "forwarding_rules",
				"type": "base",
				"fields": [
					{
						"hidden": false,
						"id": "email3253062416",
						"max": 0,
						"min": 0,
						"name": "send_from_email",
						"pattern": "",
						"presentable": false,
						"primaryKey": false,
						"required": true,
						"system": false,
						"type": "text"
					}
				]
			}
		]`

		return app.ImportCollectionsByMarshaledJSON([]byte(jsonData), false)
	}, func(app core.App) error {
		jsonData := `[
			{
				"id": "pbc_3367978789",
				"name": "forwarding_rules",
				"type": "base",
				"fields": [
					{
						"exceptDomains": null,
						"hidden": false,
						"id": "email3253062416",
						"name": "send_from_email",
						"onlyDomains": null,
						"presentable": false,
						"required": true,
						"system": false,
						"type": "email"
					}
				]
			}
		]`

		return app.ImportCollectionsByMarshaledJSON([]byte(jsonData), false)
	})
}
