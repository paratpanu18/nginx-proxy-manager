import { HasPermission } from "src/components";
import { DEAD_HOSTS, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show hosts of every user, not only your own */
	all?: boolean;
}

const DeadHosts = ({ all }: Props) => {
	return (
		<HasPermission section={DEAD_HOSTS} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default DeadHosts;
