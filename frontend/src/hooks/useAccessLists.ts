import { useQuery } from "@tanstack/react-query";
import { type AccessList, type AccessListExpansion, getAccessLists } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchAccessLists = (expand?: AccessListExpansion[], filters?: ListFilters) => {
	return getAccessLists(expand, filters);
};

const useAccessLists = (expand?: AccessListExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<AccessList[], Error>({
		queryKey: ["access-lists", { expand, ...filters }],
		queryFn: () => fetchAccessLists(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchAccessLists, useAccessLists };
