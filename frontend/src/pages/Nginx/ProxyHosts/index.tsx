import { HasPermission } from "src/components";
import { PROXY_HOSTS, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show hosts of every user, not only your own */
	all?: boolean;
}

const ProxyHosts = ({ all }: Props) => {
	return (
		<HasPermission section={PROXY_HOSTS} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default ProxyHosts;
