package secrets

import (
	"os"

	"github.com/lsherman98/resendforward/pocketbase/collections"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/resend/resend-go/v3"
)

func Init(app *pocketbase.PocketBase) error {
	app.OnRecordCreateRequest(collections.ResendAPIKeys).BindFunc(func(e *core.RecordRequestEvent) error {
		key := e.Record.GetString("key")
		if key == "" {
			return e.BadRequestError("no resend api key found in request", nil)
		}

		// ResendForward needs to retrieve received email content in addition to
		// sending forwarded messages. A Sending access key can send email but
		// cannot use the Receiving API, so validate that access before storing it.
		client := resend.NewClient(key)
		if _, err := client.Emails.Receiving.List(); err != nil {
			e.App.Logger().Warn("Resend API key failed Receiving API validation", "err", err)
			return e.BadRequestError(
				"Resend API key must have Full access and belong to the same Resend account/team as the receiving domain",
				map[string]any{"resend_error": err.Error()},
			)
		}

		encryptedKey, err := security.Encrypt([]byte(key), os.Getenv("AES_KEY"))
		if err != nil {
			e.App.Logger().Error("Failed to encrypt resend api key: ", "err", err)
			return e.InternalServerError("failed to encrypt resend api key", nil)
		}

		e.Record.Set("key", encryptedKey)
		return e.Next()
	})

	app.OnRecordCreateRequest(collections.ResendWebhookSecrets).BindFunc(func(e *core.RecordRequestEvent) error {
		key := e.Record.GetString("secret")
		if key == "" {
			return e.BadRequestError("no resend webhook secret found in request", nil)
		}

		encryptedKey, err := security.Encrypt([]byte(key), os.Getenv("AES_KEY"))
		if err != nil {
			e.App.Logger().Error("Failed to encrypt resend webhook secret: ", "err", err)
			return e.InternalServerError("failed to encrypt resend webhook secret", nil)
		}

		e.Record.Set("secret", encryptedKey)
		return e.Next()
	})

	return nil
}
