package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("forwarding_rules")
		if err != nil {
			return err
		}

		if collection.Fields.GetByName("reply_to_email") != nil {
			return nil
		}

		collection.Fields.Add(&core.EmailField{
			Name:     "reply_to_email",
			Required: false,
		})

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("forwarding_rules")
		if err != nil {
			return err
		}

		collection.Fields.RemoveByName("reply_to_email")
		return app.Save(collection)
	})
}
