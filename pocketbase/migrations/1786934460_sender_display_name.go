package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("forwarding_rules")
		if err != nil {
			return err
		}

		field := collection.Fields.GetByName("send_from_email")
		if field == nil {
			return fmt.Errorf("send_from_email field not found")
		}

		// Nothing to do if this migration was already applied manually.
		if field.Type() == "text" {
			return nil
		}
		if field.Type() != "email" {
			return fmt.Errorf("unexpected send_from_email field type: %s", field.Type())
		}

		// Preserve all existing sender values before removing the email field.
		records, err := app.FindAllRecords(collection)
		if err != nil {
			return err
		}

		senderValues := make(map[string]string, len(records))
		for _, record := range records {
			senderValues[record.Id] = record.GetString("send_from_email")
		}

		// PocketBase does not allow changing a field type in place, so remove
		// the old email field first and save the collection schema.
		collection.Fields.RemoveByName("send_from_email")
		if err := app.Save(collection); err != nil {
			return err
		}

		// Recreate the field as text. Keep it optional until the old values
		// have been restored, then make it required again below.
		collection, err = app.FindCollectionByNameOrId("forwarding_rules")
		if err != nil {
			return err
		}

		collection.Fields.Add(&core.TextField{
			Name:     "send_from_email",
			Required: false,
		})
		if err := app.Save(collection); err != nil {
			return err
		}

		// Restore the sender values into the newly-created text field.
		records, err = app.FindAllRecords("forwarding_rules")
		if err != nil {
			return err
		}

		for _, record := range records {
			value, ok := senderValues[record.Id]
			if !ok {
				continue
			}

			record.Set("send_from_email", value)
			if err := app.Save(record); err != nil {
				return err
			}
		}

		// Restore the original required constraint.
		collection, err = app.FindCollectionByNameOrId("forwarding_rules")
		if err != nil {
			return err
		}

		textField, ok := collection.Fields.GetByName("send_from_email").(*core.TextField)
		if !ok {
			return fmt.Errorf("send_from_email was not recreated as a text field")
		}
		textField.Required = true

		return app.Save(collection)
	}, func(app core.App) error {
		// Intentionally no automatic down migration: converting back to an
		// email field could reject valid values such as "Name <email@domain>".
		return nil
	})
}
