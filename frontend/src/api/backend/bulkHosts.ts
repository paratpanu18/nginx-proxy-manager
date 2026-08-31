import * as api from "./base";

export type BulkAction = "enable" | "disable" | "delete";

export interface BulkResult {
	id: number;
	result: boolean;
	error?: string;
}

export type BulkResource = "proxy-hosts" | "redirection-hosts" | "dead-hosts" | "streams";

export async function bulkHosts(
	resource: BulkResource,
	action: BulkAction,
	ids: number[],
): Promise<BulkResult[]> {
	return await api.post({
		url: `/nginx/${resource}/bulk`,
		data: { action, ids },
	});
}
