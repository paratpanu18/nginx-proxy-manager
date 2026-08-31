import { useQuery } from "@tanstack/react-query";
import { getRedirectionHosts, type HostExpansion, type RedirectionHost } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchRedirectionHosts = (expand?: HostExpansion[], filters?: ListFilters) => {
	return getRedirectionHosts(expand, filters);
};

const useRedirectionHosts = (expand?: HostExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<RedirectionHost[], Error>({
		queryKey: ["redirection-hosts", { expand, ...filters }],
		queryFn: () => fetchRedirectionHosts(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchRedirectionHosts, useRedirectionHosts };
