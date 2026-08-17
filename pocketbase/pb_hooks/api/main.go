package api

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/lsherman98/resendforward/pocketbase/collections"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/resend/resend-go/v3"
	svix "github.com/svix/svix-webhooks/go"
)

const (
	EventWebhookReceived  = "webhook.received"
	EventForwardInitiated = "forward.initiated"
	EventEmailSent        = "email.sent"
	EventEmailDelivered   = "email.delivered"
	EventEmailFailed      = "email.failed"
	EventError            = "error"

	WebhookTypeReceived  = "email.received"
	WebhookTypeSent      = "email.sent"
	WebhookTypeDelivered = "email.delivered"
	WebhookTypeFailed    = "email.failed"

	StatusPending   = "pending"
	StatusSent      = "sent"
	StatusDelivered = "delivered"
	StatusFailed    = "failed"
)

func Init(app *pocketbase.PocketBase) error {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		v1 := se.Router.Group("/api")
		v1.POST("/webhooks/resend", resendWebhookHandler)

		return se.Next()
	})
	return nil
}

func resendWebhookHandler(e *core.RequestEvent) error {
	var basePayload struct {
		Type string `json:"type"`
	}

	bodyBytes, err := io.ReadAll(e.Request.Body)
	if err != nil {
		e.App.Logger().Error("Failed to read request body: ", "err", err)
		return e.JSON(400, map[string]any{"error": "failed to read request body"})
	}

	if err := json.Unmarshal(bodyBytes, &basePayload); err != nil {
		e.App.Logger().Error("Failed to parse webhook type: ", "err", err)
		return e.JSON(400, map[string]any{"error": "invalid payload"})
	}

	switch basePayload.Type {
	case WebhookTypeReceived:
		return handleEmailReceived(e, bodyBytes)
	case WebhookTypeSent:
		return handleEmailSent(e, bodyBytes)
	case WebhookTypeDelivered:
		return handleEmailDelivered(e, bodyBytes)
	case WebhookTypeFailed:
		return handleEmailFailed(e, bodyBytes)
	default:
		e.App.Logger().Warn("Unknown webhook type: ", "type", basePayload.Type)
		return e.JSON(200, nil)
	}
}

func handleEmailReceived(e *core.RequestEvent, bodyBytes []byte) error {
	var payload EmailReceivedWebhook
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		e.App.Logger().Error("Failed to parse email.received payload: ", "err", err)
		return e.JSON(400, map[string]any{"error": "invalid payload"})
	}

	ruleEmail := payload.Data.To[0]
	rule, err := e.App.FindFirstRecordByData(collections.ForwardingRules, "rule_email", ruleEmail)
	if err != nil {
		e.App.Logger().Error("Failed to find forwarding rule: ", "email", ruleEmail, "err", err)
		return e.JSON(404, map[string]any{"error": "forwarding rule not found"})
	}

	userId := rule.GetString("user")

	forwardingEventId, err := createForwardingEvent(
		e.App,
		userId,
		rule.Id,
		payload.Data.EmailID,
		payload.Data.Subject,
		payload.Data.From,
		payload.Data.To,
	)
	if err != nil {
		e.App.Logger().Error("Failed to create forwarding event: ", "err", err)
		return e.JSON(500, map[string]any{"error": "failed to create forwarding event"})
	}

	logEvent(e.App, userId, rule.Id, forwardingEventId, EventWebhookReceived, map[string]any{
		"received_email_id": payload.Data.EmailID,
		"from":              payload.Data.From,
		"to":                payload.Data.To,
		"subject":           payload.Data.Subject,
	})

	secretRecord, err := e.App.FindFirstRecordByData(collections.ResendWebhookSecrets, "user", userId)
	if err != nil {
		e.App.Logger().Error("Failed to find webhook secret for user: ", "user_id", userId, "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message":           "webhook secret not found",
			"received_email_id": payload.Data.EmailID,
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "webhook_secret_not_found",
		})
		return e.JSON(404, map[string]any{"error": "webhook secret not found"})
	}

	encryptedSecret := secretRecord.GetString("secret")
	secret, err := security.Decrypt(encryptedSecret, os.Getenv("AES_KEY"))
	if err != nil {
		e.App.Logger().Error("Failed to decrypt webhook secret: ", "user_id", userId, "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "unable to decrypt webhook secret",
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "webhook_secret_decryption_failed",
		})
		return e.JSON(500, map[string]any{"error": "failed to decrypt webhook secret"})
	}

	wh, err := svix.NewWebhook(string(secret))
	if err != nil {
		e.App.Logger().Error("Failed to create svix webhook: ", "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "unable to create webhook verifier",
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "webhook_verifier_creation_failed",
		})
		return e.JSON(500, map[string]any{"error": "failed to create svix webhook"})
	}

	if err := wh.Verify(bodyBytes, e.Request.Header); err != nil {
		e.App.Logger().Error("Invalid webhook signature: ", "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "invalid webhook signature",
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "invalid_webhook_signature",
		})
		return e.JSON(401, map[string]any{"error": "invalid webhook signature"})
	}

	apiKeyRecord, err := e.App.FindFirstRecordByData(collections.ResendAPIKeys, "user", userId)
	if err != nil {
		e.App.Logger().Error("Failed to find Resend API key for user: ", "user_id", userId, "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "resend api key not found",
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "api_key_not_found",
		})
		return e.JSON(404, map[string]any{"error": "Resend API key not found"})
	}

	encryptedKey := apiKeyRecord.GetString("key")
	apiKey, err := security.Decrypt(encryptedKey, os.Getenv("AES_KEY"))
	if err != nil {
		e.App.Logger().Error("Failed to decrypt Resend API key: ", "user_id", userId, "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "unable to decrypt resend api key",
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "api_key_decryption_failed",
		})
		return e.JSON(500, map[string]any{"error": "failed to decrypt Resend API key"})
	}

	client := resend.NewClient(string(apiKey))

	email, err := client.Emails.Receiving.Get(payload.Data.EmailID)
	if err != nil {
		e.App.Logger().Error("Failed to get email: ", "received_email_id", payload.Data.EmailID, "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message":           "unable to get email content",
			"received_email_id": payload.Data.EmailID,
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "email_content_fetch_failed",
		})
		return e.JSON(404, map[string]any{"error": "email not found"})
	}

	emailAttachments := []*resend.Attachment{}
	if len(email.Attachments) > 0 {
		attachments, err := client.Emails.Receiving.ListAttachments(payload.Data.EmailID)
		if err != nil {
			e.App.Logger().Error("Failed to list attachments: ", "received_email_id", payload.Data.EmailID, "err", err)
			logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
				"message": "failed to list attachments",
			})
		} else {
			for _, attachment := range attachments.Data {
				resp, err := http.Get(attachment.DownloadUrl)
				if err != nil {
					e.App.Logger().Error("Failed to download attachment", "filename", attachment.Filename, "url", attachment.DownloadUrl, "err", err)
					continue
				}
				defer resp.Body.Close()

				content, err := io.ReadAll(resp.Body)
				if err != nil {
					e.App.Logger().Error("Failed to read attachment content", "filename", attachment.Filename, "err", err)
					continue
				}

				emailAttachments = append(emailAttachments, &resend.Attachment{
					ContentType: attachment.ContentType,
					Filename:    attachment.Filename,
					Content:     content,
					ContentId:   attachment.ContentId,
				})
			}
		}
	}

	logEvent(e.App, userId, rule.Id, forwardingEventId, EventForwardInitiated, map[string]any{
		"received_email_id": payload.Data.EmailID,
		"subject":           payload.Data.Subject,
	})

	forwardToEmail := rule.GetString("forward_to_email")
	sendFromEmail := rule.GetString("send_from_email")
	replyToEmail := rule.GetString("reply_to_email")
	if replyToEmail == "" {
		replyToEmail = email.From
	}

	params := &resend.SendEmailRequest{
		From:        sendFromEmail,
		To:          []string{forwardToEmail},
		Subject:     payload.Data.Subject,
		Html:        email.Html,
		Text:        email.Text,
		Attachments: emailAttachments,
		ReplyTo:     replyToEmail,
		Bcc:         email.Bcc,
		Cc:          email.Cc,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		e.App.Logger().Error("Failed to send email: ", "err", err)
		logEvent(e.App, userId, rule.Id, forwardingEventId, EventError, map[string]any{
			"message": "failed to send email",
			"error":   err.Error(),
		})
		updateForwardingEventStatus(e.App, forwardingEventId, StatusFailed, "", map[string]any{
			"reason": "email_send_failed",
			"error":  err.Error(),
		})
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send email"})
	}

	if err := updateForwardingEventStatus(e.App, forwardingEventId, StatusSent, sent.Id, nil); err != nil {
		e.App.Logger().Error("Failed to update forwarding event status: ", "err", err)
	}

	return e.JSON(200, nil)
}

func handleEmailSent(e *core.RequestEvent, bodyBytes []byte) error {
	var payload EmailSentWebhook
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		e.App.Logger().Error("Failed to parse email.sent payload: ", "err", err)
		return e.JSON(400, map[string]any{"error": "invalid payload"})
	}

	forwardingEvent, err := findForwardingEventByResendEmailID(e.App, payload.Data.EmailID)
	if err != nil {
		e.App.Logger().Debug("No forwarding event found for email.sent: ", "received_email_id", payload.Data.EmailID)
		return e.JSON(200, nil)
	}

	userId := forwardingEvent.GetString("user")
	ruleId := forwardingEvent.GetString("rule")

	logEvent(e.App, userId, ruleId, forwardingEvent.Id, EventEmailSent, map[string]any{
		"sent_email_id": payload.Data.EmailID,
		"to":            payload.Data.To,
		"subject":       payload.Data.Subject,
	})

	return e.JSON(200, nil)
}

func handleEmailDelivered(e *core.RequestEvent, bodyBytes []byte) error {
	var payload EmailDeliveredWebhook
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		e.App.Logger().Error("Failed to parse email.delivered payload: ", "err", err)
		return e.JSON(400, map[string]any{"error": "invalid payload"})
	}

	forwardingEvent, err := findForwardingEventByResendEmailID(e.App, payload.Data.EmailID)
	if err != nil {
		e.App.Logger().Debug("No forwarding event found for email.delivered: ", "received_email_id", payload.Data.EmailID)
		return e.JSON(200, nil)
	}

	userId := forwardingEvent.GetString("user")
	ruleId := forwardingEvent.GetString("rule")

	if err := updateForwardingEventStatus(e.App, forwardingEvent.Id, StatusDelivered, "", nil); err != nil {
		e.App.Logger().Error("Failed to update forwarding event status to delivered: ", "err", err)
	}

	logEvent(e.App, userId, ruleId, forwardingEvent.Id, EventEmailDelivered, map[string]any{
		"sent_email_id": payload.Data.EmailID,
		"to":            payload.Data.To,
		"subject":       payload.Data.Subject,
	})

	return e.JSON(200, nil)
}

func handleEmailFailed(e *core.RequestEvent, bodyBytes []byte) error {
	var payload EmailFailedWebhook
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		e.App.Logger().Error("Failed to parse email.failed payload: ", "err", err)
		return e.JSON(400, map[string]any{"error": "invalid payload"})
	}

	forwardingEvent, err := findForwardingEventByResendEmailID(e.App, payload.Data.EmailID)
	if err != nil {
		e.App.Logger().Debug("No forwarding event found for email.failed: ", "received_email_id", payload.Data.EmailID)
		return e.JSON(200, nil)
	}

	userId := forwardingEvent.GetString("user")
	ruleId := forwardingEvent.GetString("rule")

	errorData := map[string]any{
		"reason": payload.Data.Failed.Reason,
	}
	if err := updateForwardingEventStatus(e.App, forwardingEvent.Id, StatusFailed, "", errorData); err != nil {
		e.App.Logger().Error("Failed to update forwarding event status to failed: ", "err", err)
	}

	logEvent(e.App, userId, ruleId, forwardingEvent.Id, EventEmailFailed, map[string]any{
		"sent_email_id": payload.Data.EmailID,
		"to":            payload.Data.To,
		"subject":       payload.Data.Subject,
		"reason":        payload.Data.Failed.Reason,
	})

	return e.JSON(200, nil)
}

func createForwardingEvent(app core.App, user, rule, receivedEmailID, subject, from string, to []string) (string, error) {
	collection, err := app.FindCollectionByNameOrId(collections.ForwardingEvents)
	if err != nil {
		return "", err
	}

	event := core.NewRecord(collection)
	event.Set("user", user)
	event.Set("rule", rule)
	event.Set("received_email_id", receivedEmailID)
	event.Set("status", StatusPending)
	event.Set("subject", subject)
	event.Set("from", from)
	event.Set("to", to[0])

	if err := app.Save(event); err != nil {
		return "", err
	}

	return event.Id, nil
}

func updateForwardingEventStatus(app core.App, eventId, status, resendEmailID string, errorData map[string]any) error {
	event, err := app.FindRecordById(collections.ForwardingEvents, eventId)
	if err != nil {
		return err
	}

	event.Set("status", status)
	if resendEmailID != "" {
		event.Set("sent_email_id", resendEmailID)
	}
	if errorData != nil {
		event.Set("error", errorData)
	}

	return app.Save(event)
}

func findForwardingEventByResendEmailID(app core.App, resendEmailID string) (*core.Record, error) {
	return app.FindFirstRecordByData(collections.ForwardingEvents, "sent_email_id", resendEmailID)
}

func logEvent(app core.App, user, rule, forwardingEvent, eventType string, metadata map[string]any) {
	eventLogsCollection, err := app.FindCollectionByNameOrId(collections.EventLogs)
	if err != nil {
		app.Logger().Error("Failed to find event logs collection: ", "err", err)
		return
	}

	event := core.NewRecord(eventLogsCollection)
	event.Set("user", user)
	event.Set("rule", rule)
	if forwardingEvent != "" {
		event.Set("event", forwardingEvent)
	}
	event.Set("type", eventType)
	event.Set("metadata", metadata)

	if err := app.Save(event); err != nil {
		app.Logger().Error("Failed to log event: ", "err", err)
	}
}
