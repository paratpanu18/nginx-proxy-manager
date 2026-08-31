import { useQuery } from "@tanstack/react-query";
import { type Certificate, type CertificateExpansion, getCertificates } from "src/api/backend";
import type { ListFilters } from "./ListFilters";

const fetchCertificates = (expand?: CertificateExpansion[], filters?: ListFilters) => {
	return getCertificates(expand, filters);
};

const useCertificates = (expand?: CertificateExpansion[], options = {}, filters?: ListFilters) => {
	return useQuery<Certificate[], Error>({
		queryKey: ["certificates", { expand, ...filters }],
		queryFn: () => fetchCertificates(expand, filters),
		staleTime: 60 * 1000,
		...options,
	});
};

export { fetchCertificates, useCertificates };
