import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateForwardingRule } from "@/lib/api/mutations";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateRuleDialogProps {
  isConfigured: boolean;
  currentRuleCount: number;
}

export function CreateRule({ isConfigured }: CreateRuleDialogProps) {
  const createRule = useCreateForwardingRule();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    ruleEmail: "",
    toEmail: "",
    fromEmail: "",
  });

  const isButtonDisabled = !isConfigured;

  const handleCreate = async () => {
    if (!formData.ruleName || !formData.ruleEmail || !formData.toEmail || !formData.fromEmail) {
      toast.error("All fields are required");
      return;
    }

    try {
      await createRule.mutateAsync({
        ruleName: formData.ruleName,
        ruleEmail: formData.ruleEmail,
        toEmail: formData.toEmail,
        fromEmail: formData.fromEmail,
      });
      setIsOpen(false);
      setFormData({ ruleName: "", ruleEmail: "", toEmail: "", fromEmail: "" });
      toast.success("Forwarding rule created successfully");
    } catch (error) {
      toast.error("Failed to create forwarding rule");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isButtonDisabled} className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="border-2 border-secondary">
        <DialogHeader>
          <DialogTitle className="text-primary">Create Forwarding Rule</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up a new email forwarding rule. Emails sent to the rule address will be forwarded to your destination.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name" className="text-primary">
              Rule Name
            </Label>
            <Input
              className="text-secondary"
              id="rule-name"
              type="text"
              placeholder="Support Emails"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">A friendly name to identify this rule</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-email" className="text-primary">
              Rule Email Address
            </Label>
            <Input
              id="rule-email"
              type="email"
              className="text-secondary"
              placeholder="catch@yourdomain.com"
              value={formData.ruleEmail}
              onChange={(e) => setFormData({ ...formData, ruleEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">The email address that will trigger this forwarding rule</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-email" className="text-primary">
              Forward To
            </Label>
            <Input
              className="text-secondary"
              id="to-email"
              type="email"
              placeholder="destination@example.com"
              value={formData.toEmail}
              onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Where the email will be forwarded to</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-email" className="text-primary">
              Send From
            </Label>
            <Input
              id="from-email"
              className="text-secondary"
              type="text"
              placeholder="VidBlitz <sales@vidblitz.ai>"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Sender name and verified address, for example: VidBlitz &lt;sales@vidblitz.ai&gt;
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createRule.isPending}>
            {createRule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
