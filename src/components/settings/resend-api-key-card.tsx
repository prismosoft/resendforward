import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Loader2, Key, CheckCircle2, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { useGetResendApiKey } from "@/lib/api/queries";
import { useSetResendAPIkey, useDeleteResendAPIkey } from "@/lib/api/mutations";

export function ResendApiKeyCard() {
  const { data: apiKey } = useGetResendApiKey();
  const setApiKey = useSetResendAPIkey();
  const deleteApiKey = useDeleteResendAPIkey();
  const [newApiKey, setNewApiKey] = useState("");

  const handleSetApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    try {
      if (apiKey) {
        await deleteApiKey.mutateAsync(apiKey.id);
      }
      await setApiKey.mutateAsync(newApiKey);
      setNewApiKey("");
      toast.success("Resend API key updated successfully");
    } catch (error) {
      toast.error("Invalid Resend API key. Make sure it has Full access and belongs to the receiving domain's account/team.");
    }
  };

  const handleDeleteApiKey = async () => {
    if (!apiKey) return;

    try {
      await deleteApiKey.mutateAsync(apiKey.id);
      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <CardTitle>Resend API Key</CardTitle>
        </div>
        <CardDescription>
          Your Resend API key is used to retrieve incoming email content and send forwarded emails. Get your API key from{" "}
          <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
            resend.com/api-keys
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-primary">
          <Info className="h-4 w-4 stroke-primary" />
          <AlertDescription>
            Use a <strong>Full access</strong> API key from the same Resend account/team that owns your receiving domain. Sending-only keys cannot retrieve received email content.
          </AlertDescription>
        </Alert>
        {apiKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">API Key Configured</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteApiKey} disabled={deleteApiKey.isPending}>
                {deleteApiKey.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-api-key">Update API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="new-api-key"
                  type="password"
                  placeholder="re_..."
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleSetApiKey} disabled={setApiKey.isPending || deleteApiKey.isPending}>
                  {setApiKey.isPending || deleteApiKey.isPending ? (
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
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="re_..."
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleSetApiKey} disabled={setApiKey.isPending}>
                {setApiKey.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
