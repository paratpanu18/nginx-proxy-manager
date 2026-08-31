import { HasPermission } from "src/components";
import { CERTIFICATES, VIEW } from "src/modules/Permissions";
import TableWrapper from "./TableWrapper";

interface Props {
	/** Show certificates of every user, not only your own */
	all?: boolean;
}

const Certificates = ({ all }: Props) => {
	return (
		<HasPermission section={CERTIFICATES} permission={VIEW} pageLoading loadingNoLogo>
			<TableWrapper all={all} />
		</HasPermission>
	);
};

export default Certificates;
