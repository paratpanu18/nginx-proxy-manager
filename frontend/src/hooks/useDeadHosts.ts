import { useQuery } from "@tanstack/react-query";
import { type DeadHost, getDeadHosts, type HostExpansion } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchDeadHosts = (expand?: HostExpansion[], filters?: ListFilters) => {
	return getDeadHosts(expand, filters);
};

const useDeadHosts = (expand?: HostExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<DeadHost[], Error>({
		queryKey: ["dead-hosts", { expand, ...filters }],
		queryFn: () => fetchDeadHosts(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchDeadHosts, useDeadHosts };
