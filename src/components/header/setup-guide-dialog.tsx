import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

export function SetupGuideDialog() {
  const webhookUrl = `${window.location.origin}/api/webhooks/resend`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
          <span className="sr-only">Setup Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="min-h-[75vh] max-h-[75vh] min-w-[40vw] overflow-y-auto dark-scrollbar border-2 border-primary"
      >
        <DialogHeader className="text-primary">
          <DialogTitle>Setup Guide</DialogTitle>
          <DialogDescription>
            Follow these steps to configure your application and start receiving webhook events from Resend.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Get Your Resend API Key
            </h3>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                You'll need a Resend API key to forward emails. Get one from the Resend dashboard:
              </p>
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                resend.com/api-keys
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-sm text-muted-foreground">
                Add your API key in the <strong>Settings</strong> page under "Resend API Key".
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              Configure Webhook in Resend
            </h3>
            <div className="ml-8 space-y-3">
              <p className="text-sm text-muted-foreground">
                Set up a webhook endpoint in Resend to receive email events:
              </p>
              <a
                href="https://resend.com/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                resend.com/webhooks
                <ExternalLink className="h-3 w-3" />
              </a>
              <Alert className="border-primary">
                <Info className="h-4 w-4 stroke-primary" />
                <AlertDescription>
                  <div className="space-y-3 text-primary">
                    <div>
                      <p className="font-medium mb-1">Webhook endpoint URL:</p>
                      <code className="px-2 py-1 bg-muted rounded text-sm block w-fit">
                        {webhookUrl}
                      </code>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Enable these events:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                        <li>
                          <code className="px-1 py-0.5 bg-muted rounded">email.received</code>
                        </li>
                        <li>
                          <code className="px-1 py-0.5 bg-muted rounded">email.sent</code>
                        </li>
                        <li>
                          <code className="px-1 py-0.5 bg-muted rounded">email.delivered</code>
                        </li>
                        <li>
                          <code className="px-1 py-0.5 bg-muted rounded">email.failed</code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                3
              </span>
              Add Webhook Secret
            </h3>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                After creating your webhook in Resend, copy the webhook signing secret.
              </p>
              <p className="text-sm text-muted-foreground">
                Add this secret in the <strong>Settings</strong> page under "Webhook Secret" to verify that webhook
                events are legitimately from Resend.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                4
              </span>
              Create Forwarding Rules
            </h3>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Go to the <strong>Rules</strong> page to create forwarding rules. Define which emails should be
                forwarded and where they should be sent.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                5
              </span>
              Monitor Events
            </h3>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Once configured, view incoming webhook events and forwarding activity in the <strong>Events</strong> and{" "}
                <strong>Logs</strong> pages.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
