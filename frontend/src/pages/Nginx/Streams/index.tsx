import { HasPermission } from "src/components";
import { STREAMS, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show hosts of every user, not only your own */
	all?: boolean;
}

const Streams = ({ all }: Props) => {
	return (
		<HasPermission section={STREAMS} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default Streams;
