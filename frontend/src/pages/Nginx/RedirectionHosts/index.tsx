import { HasPermission } from "src/components";
import { REDIRECTION_HOSTS, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show hosts of every user, not only your own */
	all?: boolean;
}

const RedirectionHosts = ({ all }: Props) => {
	return (
		<HasPermission section={REDIRECTION_HOSTS} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default RedirectionHosts;
