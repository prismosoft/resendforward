/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	EventLogs = "event_logs",
	ForwardingCounts = "forwarding_counts",
	ForwardingEvents = "forwarding_events",
	ForwardingRules = "forwarding_rules",
	ForwardingStats = "forwarding_stats",
	ResendApiKeys = "resend_api_keys",
	ResendWebhookSecrets = "resend_webhook_secrets",
	RulesStats = "rules_stats",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum EventLogsTypeOptions {
	"webhook.received" = "webhook.received",
	"forward.initiated" = "forward.initiated",
	"email.sent" = "email.sent",
	"email.delivered" = "email.delivered",
	"email.failed" = "email.failed",
	"error" = "error",
}
export type EventLogsRecord<Tmetadata = unknown> = {
	created: IsoAutoDateString
	event?: RecordIdString
	id: string
	metadata?: null | Tmetadata
	rule: RecordIdString
	type: EventLogsTypeOptions
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ForwardingCountsRecord = {
	id: string
	rule?: RecordIdString
	total?: number
	user: RecordIdString
}

export enum ForwardingEventsStatusOptions {
	"pending" = "pending",
	"delivered" = "delivered",
	"failed" = "failed",
	"sent" = "sent",
}
export type ForwardingEventsRecord<Terror = unknown> = {
	created: IsoAutoDateString
	error?: null | Terror
	from?: string
	id: string
	received_email_id: string
	rule: RecordIdString
	sent_email_id?: string
	status: ForwardingEventsStatusOptions
	subject?: string
	to?: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ForwardingRulesRecord = {
	created: IsoAutoDateString
	enabled?: boolean
	forward_to_email: string
	id: string
	reply_to_email?: string
	rule_email: string
	rule_name?: string
	send_from_email: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ForwardingStatsRecord = {
	delivered?: number
	failed?: number
	id: string
	total?: number
	user: RecordIdString
}

export type ResendApiKeysRecord = {
	created: IsoAutoDateString
	id: string
	key: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ResendWebhookSecretsRecord = {
	created: IsoAutoDateString
	id: string
	secret: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type RulesStatsRecord = {
	active_rules?: number
	id: string
	total_rules?: number
	user: RecordIdString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type EventLogsResponse<Tmetadata = unknown, Texpand = unknown> = Required<EventLogsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type ForwardingCountsResponse<Texpand = unknown> = Required<ForwardingCountsRecord> & BaseSystemFields<Texpand>
export type ForwardingEventsResponse<Terror = unknown, Texpand = unknown> = Required<ForwardingEventsRecord<Terror>> & BaseSystemFields<Texpand>
export type ForwardingRulesResponse<Texpand = unknown> = Required<ForwardingRulesRecord> & BaseSystemFields<Texpand>
export type ForwardingStatsResponse<Texpand = unknown> = Required<ForwardingStatsRecord> & BaseSystemFields<Texpand>
export type ResendApiKeysResponse<Texpand = unknown> = Required<ResendApiKeysRecord> & BaseSystemFields<Texpand>
export type ResendWebhookSecretsResponse<Texpand = unknown> = Required<ResendWebhookSecretsRecord> & BaseSystemFields<Texpand>
export type RulesStatsResponse<Texpand = unknown> = Required<RulesStatsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	event_logs: EventLogsRecord
	forwarding_counts: ForwardingCountsRecord
	forwarding_events: ForwardingEventsRecord
	forwarding_rules: ForwardingRulesRecord
	forwarding_stats: ForwardingStatsRecord
	resend_api_keys: ResendApiKeysRecord
	resend_webhook_secrets: ResendWebhookSecretsRecord
	rules_stats: RulesStatsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	event_logs: EventLogsResponse
	forwarding_counts: ForwardingCountsResponse
	forwarding_events: ForwardingEventsResponse
	forwarding_rules: ForwardingRulesResponse
	forwarding_stats: ForwardingStatsResponse
	resend_api_keys: ResendApiKeysResponse
	resend_webhook_secrets: ResendWebhookSecretsResponse
	rules_stats: RulesStatsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
