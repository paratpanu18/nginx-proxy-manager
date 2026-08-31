import { useQuery } from "@tanstack/react-query";
import { getStreams, type HostExpansion, type Stream } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchStreams = (expand?: HostExpansion[], filters?: ListFilters) => {
	return getStreams(expand, filters);
};

const useStreams = (expand?: HostExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<Stream[], Error>({
		queryKey: ["streams", { expand, ...filters }],
		queryFn: () => fetchStreams(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchStreams, useStreams };
