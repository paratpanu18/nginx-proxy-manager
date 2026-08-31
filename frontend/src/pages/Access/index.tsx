import { HasPermission } from "src/components";
import { ACCESS_LISTS, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show access lists of every user, not only your own */
	all?: boolean;
}

const Access = ({ all }: Props) => {
	return (
		<HasPermission section={ACCESS_LISTS} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default Access;
