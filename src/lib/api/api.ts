import { pb } from "../pocketbase";
import { Collections, EventLogsTypeOptions, ForwardingEventsStatusOptions, type EventLogsResponse, type ForwardingEventsRecord, type ForwardingEventsResponse, type ForwardingRulesRecord, type ForwardingRulesResponse, type ResendApiKeysResponse, type ResendWebhookSecretsResponse } from "../pocketbase-types";
import { getUserId } from "../utils";

export interface ForwardingEventFilters {
    status?: ForwardingEventsStatusOptions;
    ruleId?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
}

export interface EventLogFilters {
    eventId?: string;
    ruleId?: string;
    type?: EventLogsTypeOptions;
    startDate?: string;
    endDate?: string;
    sort?: string;
}

export async function createNewForwardingRule(rule_name: string, rule_email: string, forward_to_email: string, send_from_email: string, reply_to_email?: string) {
    const data = {
        user: getUserId(),
        rule_name,
        rule_email,
        forward_to_email,
        send_from_email,
        reply_to_email: reply_to_email || "",
        enabled: true
    }

    return await pb.collection(Collections.ForwardingRules).create(data);
}

export async function updateForwardingRule(id: string, updates: Partial<ForwardingRulesRecord>) {
    return await pb.collection(Collections.ForwardingRules).update(id, updates);
}

export async function deleteForwardingRule(id: string) {
    return await pb.collection(Collections.ForwardingRules).delete(id);
}

export async function getForwardingRules() {
    return await pb.collection(Collections.ForwardingRules).getFullList<ForwardingRulesResponse>({
        sort: '-created'
    });
}

export async function getForwardingRule(id: string) {
    return await pb.collection(Collections.ForwardingRules).getOne<ForwardingRulesResponse>(id);
}

export async function getForwardingEvents(filters?: ForwardingEventFilters) {
    const filterParts: string[] = [];

    if (filters?.status) {
        filterParts.push(`status = "${filters.status}"`);
    }
    if (filters?.ruleId) {
        filterParts.push(`rule = "${filters.ruleId}"`);
    }
    if (filters?.startDate) {
        filterParts.push(`created >= "${filters.startDate}"`);
    }
    if (filters?.endDate) {
        filterParts.push(`created <= "${filters.endDate}"`);
    }

    return await pb.collection(Collections.ForwardingEvents).getFullList<ForwardingEventsResponse>({
        filter: filterParts.length > 0 ? filterParts.join(' && ') : undefined,
        sort: filters?.sort || '-created',
        expand: 'rule'
    });
}

export async function getForwardingEvent(id: string) {
    return await pb.collection(Collections.ForwardingEvents).getOne<ForwardingEventsRecord>(id);
}

export async function getForwardingEventLogs(filters?: EventLogFilters) {
    const filterParts: string[] = [];

    if (filters?.eventId) {
        filterParts.push(`event = "${filters.eventId}"`);
    }
    if (filters?.ruleId) {
        filterParts.push(`rule = "${filters.ruleId}"`);
    }
    if (filters?.type) {
        filterParts.push(`type = "${filters.type}"`);
    }
    if (filters?.startDate) {
        filterParts.push(`created >= "${filters.startDate}"`);
    }
    if (filters?.endDate) {
        filterParts.push(`created <= "${filters.endDate}"`);
    }

    return await pb.collection(Collections.EventLogs).getFullList<EventLogsResponse>({
        filter: filterParts.length > 0 ? filterParts.join(' && ') : undefined,
        sort: filters?.sort || '-created',
        expand: 'rule,event'
    });
}

export async function getResendApiKey() {
    try {
        return await pb.collection(Collections.ResendApiKeys).getFirstListItem<ResendApiKeysResponse>("", {
            sort: '-created'
        });
    } catch (error) {
        return null;
    }
}

export async function setResendAPIkey(api_key: string) {
    return await pb.collection(Collections.ResendApiKeys).create({
        user: getUserId(),
        key: api_key
    });
}

export async function deleteResendAPIkey(id: string) {
    return await pb.collection(Collections.ResendApiKeys).delete(id);
}

export async function getResendWebhookSecret() {
    try {
        return await pb.collection(Collections.ResendWebhookSecrets).getFirstListItem<ResendWebhookSecretsResponse>("", {
            sort: '-created'
        });
    } catch (error) {
        return null;
    }
}

export async function setResendWebhookSecret(webhook_secret: string) {
    return await pb.collection(Collections.ResendWebhookSecrets).create({
        user: getUserId(),
        secret: webhook_secret
    });
}

export async function deleteResendWebhookSecret(id: string) {
    return await pb.collection(Collections.ResendWebhookSecrets).delete(id);
}

export async function deleteAccount() {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return await pb.collection(Collections.Users).delete(userId);
}

export const getRuleForwardingCount = async (ruleId: string) => {
    return await pb.collection(Collections.ForwardingCounts).getFirstListItem(`rule = "${ruleId}"`)
}

export const getForwardingStats = async () => {
    return await pb.collection(Collections.ForwardingStats).getFirstListItem("")
}

export const getRulesStats = async () => {
    return await pb.collection(Collections.RulesStats).getFirstListItem("");
}

