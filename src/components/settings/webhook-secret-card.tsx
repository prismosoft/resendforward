import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Loader2, Webhook, CheckCircle2, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { useGetResendWebhookSecret } from "@/lib/api/queries";
import { useSetResendWebhookSecret, useDeleteResendWebhookSecret } from "@/lib/api/mutations";

export function WebhookSecretCard() {
  const { data: webhookSecret } = useGetResendWebhookSecret();
  const setWebhookSecret = useSetResendWebhookSecret();
  const deleteWebhookSecret = useDeleteResendWebhookSecret();
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const webhookUrl = `${window.location.origin}/api/webhooks/resend`;

  const handleSetWebhookSecret = async () => {
    if (!newWebhookSecret.trim()) {
      toast.error("Please enter a webhook secret");
      return;
    }

    try {
      if (webhookSecret) {
        await deleteWebhookSecret.mutateAsync(webhookSecret.id);
      }
      await setWebhookSecret.mutateAsync(newWebhookSecret);
      setNewWebhookSecret("");
      toast.success("Webhook secret updated successfully");
    } catch (error) {
      toast.error("Failed to update webhook secret");
    }
  };

  const handleDeleteWebhookSecret = async () => {
    if (!webhookSecret) return;

    try {
      await deleteWebhookSecret.mutateAsync(webhookSecret.id);
      toast.success("Webhook secret deleted successfully");
    } catch (error) {
      toast.error("Failed to delete webhook secret");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          <CardTitle>Webhook Secret</CardTitle>
        </div>
        <CardDescription>
          The webhook secret verifies that webhook events are from Resend. Get your webhook signing secret from{" "}
          <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline">
            resend.com/webhooks
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        {webhookSecret ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Webhook Secret Configured</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteWebhookSecret}
                disabled={deleteWebhookSecret.isPending}
              >
                {deleteWebhookSecret.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-webhook-secret">Update Webhook Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="new-webhook-secret"
                  type="password"
                  placeholder="whsec_..."
                  value={newWebhookSecret}
                  onChange={(e) => setNewWebhookSecret(e.target.value)}
                  className="font-mono"
                />
                <Button
                  onClick={handleSetWebhookSecret}
                  disabled={setWebhookSecret.isPending || deleteWebhookSecret.isPending}
                >
                  {setWebhookSecret.isPending || deleteWebhookSecret.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-secret"
                type="password"
                placeholder="whsec_..."
                value={newWebhookSecret}
                onChange={(e) => setNewWebhookSecret(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleSetWebhookSecret} disabled={setWebhookSecret.isPending}>
                {setWebhookSecret.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
