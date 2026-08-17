import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewForwardingRule, deleteAccount, deleteForwardingRule, deleteResendAPIkey, deleteResendWebhookSecret, setResendAPIkey, setResendWebhookSecret, updateForwardingRule } from "./api";
import { handleError } from "../utils";
import type { ForwardingRulesRecord } from "../pocketbase-types";

export function useCreateForwardingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ruleName, ruleEmail, toEmail, fromEmail, replyToEmail }: { ruleName: string, ruleEmail: string, toEmail: string, fromEmail: string, replyToEmail?: string }) => createNewForwardingRule(ruleName, ruleEmail, toEmail, fromEmail, replyToEmail),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forwardingRules"] });
            queryClient.invalidateQueries({ queryKey: ["rulesStats"] });
        },
    })
}

export function useUpdateForwardingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<ForwardingRulesRecord> }) => updateForwardingRule(id, updates),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forwardingRules"] });
            queryClient.invalidateQueries({ queryKey: ["rulesStats"] });
        },
    })
}

export function useDeleteForwardingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteForwardingRule(id),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forwardingRules"] });
            queryClient.invalidateQueries({ queryKey: ["rulesStats"] });
        },
    })
}

export function useSetResendAPIkey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (api_key: string) => setResendAPIkey(api_key),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resendApiKey"] });
        },
    })
}

export function useDeleteResendAPIkey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteResendAPIkey(id),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resendApiKey"] });
        },
    })
}

export function useSetResendWebhookSecret() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (secret: string) => setResendWebhookSecret(secret),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resendWebhookSecret"] });
        },
    })
}

export function useDeleteResendWebhookSecret() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteResendWebhookSecret(id),
        onError: handleError,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resendWebhookSecret"] });
        },
    })
}

export function useDeleteAccount() {
    return useMutation({
        mutationFn: () => deleteAccount(),
        onError: handleError,
    })
}