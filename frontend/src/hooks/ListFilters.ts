/**
 * Optional filters accepted by the list hooks. They are passed through to the
 * API as query parameters (camelCase keys are decamelized automatically).
 */
interface ListFilters {
	/** "me" or a numeric user id, to narrow results to a specific owner */
	ownerUserId?: string;
}

export type { ListFilters };
