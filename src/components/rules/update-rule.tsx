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
} from "@/components/ui/dialog";
import { useUpdateForwardingRule } from "@/lib/api/mutations";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ForwardingRulesResponse } from "@/lib/pocketbase-types";

interface UpdateRuleProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rule: ForwardingRulesResponse | null;
  onUpdateSuccess?: () => void;
}

export function UpdateRule({ isOpen, onOpenChange, rule, onUpdateSuccess }: UpdateRuleProps) {
  const updateRule = useUpdateForwardingRule();
  const [formData, setFormData] = useState({
    ruleName: "",
    ruleEmail: "",
    toEmail: "",
    fromEmail: "",
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        ruleName: rule.rule_name,
        ruleEmail: rule.rule_email,
        toEmail: rule.forward_to_email,
        fromEmail: rule.send_from_email,
      });
    }
  }, [rule]);

  const handleUpdate = async () => {
    if (!rule) return;

    if (!formData.ruleName || !formData.ruleEmail || !formData.toEmail || !formData.fromEmail) {
      toast.error("All fields are required");
      return;
    }

    try {
      await updateRule.mutateAsync({
        id: rule.id,
        updates: {
          rule_name: formData.ruleName,
          rule_email: formData.ruleEmail,
          forward_to_email: formData.toEmail,
          send_from_email: formData.fromEmail,
        },
      });
      onOpenChange(false);
      toast.success("Forwarding rule updated successfully");
      onUpdateSuccess?.();
    } catch (error) {
      toast.error("Failed to update forwarding rule");
    }
  };

  if (!rule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="border-2 border-secondary">
        <DialogHeader>
          <DialogTitle className="text-primary">Update Forwarding Rule</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Edit your email forwarding rule. Emails sent to the rule address will be forwarded to your destination.
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updateRule.isPending}>
            {updateRule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
