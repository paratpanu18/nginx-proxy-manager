import { useQuery } from "@tanstack/react-query";
import { getProxyHosts, type ProxyHost, type ProxyHostExpansion } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchProxyHosts = (expand?: ProxyHostExpansion[], filters?: ListFilters) => {
	return getProxyHosts(expand, filters);
};

const useProxyHosts = (expand?: ProxyHostExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<ProxyHost[], Error>({
		queryKey: ["proxy-hosts", { expand, ...filters }],
		queryFn: () => fetchProxyHosts(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchProxyHosts, useProxyHosts };
