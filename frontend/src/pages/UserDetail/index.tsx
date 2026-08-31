import cn from "classnames";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { GravatarFormatter, HasPermission, LoadingPage } from "src/components";
import {
	useAccessLists,
	useCertificates,
	useDeadHosts,
	useProxyHosts,
	useRedirectionHosts,
	useStreams,
	useUser,
} from "src/hooks";
import { T } from "src/locale";
import { ADMIN, VIEW } from "src/modules/Permissions";
import AccessTable from "src/pages/Access/Table";
import CertificatesTable from "src/pages/Certificates/Table";
import DeadHostsTable from "src/pages/Nginx/DeadHosts/Table";
import ProxyHostsTable from "src/pages/Nginx/ProxyHosts/Table";
import RedirectionHostsTable from "src/pages/Nginx/RedirectionHosts/Table";
import StreamsTable from "src/pages/Nginx/Streams/Table";

const tabs = [
	{ id: "proxy-hosts", label: "proxy-hosts" },
	{ id: "redirection-hosts", label: "redirection-hosts" },
	{ id: "streams", label: "streams" },
	{ id: "dead-hosts", label: "dead-hosts" },
	{ id: "certificates", label: "certificates" },
	{ id: "access-lists", label: "access-lists" },
];

interface Props {
	userId?: string | number;
}

const UserDetailInner = ({ userId }: Props) => {
	const id = Number.parseInt(`${userId ?? "0"}`, 10);
	const [activeTab, setActiveTab] = useState("proxy-hosts");

	const { data: user, isLoading: userLoading } = useUser(id);

	const proxyHosts = useProxyHosts(["owner", "access_list", "certificate"], {}, { ownerUserId: `${id}` });
	const redirectionHosts = useRedirectionHosts(["owner", "certificate"], {}, { ownerUserId: `${id}` });
	const streams = useStreams(["owner", "certificate"], {}, { ownerUserId: `${id}` });
	const deadHosts = useDeadHosts(["owner", "certificate"], {}, { ownerUserId: `${id}` });
	const certificates = useCertificates(
		["owner", "proxy_hosts", "redirection_hosts", "dead_hosts", "streams"],
		{},
		{ ownerUserId: `${id}` },
	);
	const accessLists = useAccessLists(["owner", "items", "clients"], {}, { ownerUserId: `${id}` });

	if (userLoading) {
		return <LoadingPage />;
	}

	const tabIsLoading =
		(activeTab === "proxy-hosts" && proxyHosts.isLoading) ||
		(activeTab === "redirection-hosts" && redirectionHosts.isLoading) ||
		(activeTab === "streams" && streams.isLoading) ||
		(activeTab === "dead-hosts" && deadHosts.isLoading) ||
		(activeTab === "certificates" && certificates.isLoading) ||
		(activeTab === "access-lists" && accessLists.isLoading);

	return (
		<div className="mt-4">
			<div className="card">
				<div className="card-header">
					<div className="row w-full align-items-center">
						<div className="col-auto">
							<GravatarFormatter url={user?.avatar ?? ""} name={user?.name ?? ""} />
						</div>
						<div className="col">
							<h2 className="mt-1 mb-0">
								<T id="user.resources" />
							</h2>
							<div className="text-muted">
								<T id="user.resources.subtitle" data={{ name: user?.name ?? user?.email ?? "" }} />
							</div>
						</div>
					</div>
				</div>
				<div className="card-header p-0 border-0">
					<ul className="nav nav-tabs">
						{tabs.map((tab) => (
							<li className="nav-item" key={tab.id}>
								<button
									type="button"
									className={cn("nav-link", activeTab === tab.id && "active")}
									onClick={() => setActiveTab(tab.id)}
								>
									<T id={tab.label} />
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>

			{tabIsLoading ? (
				<LoadingPage noLogo />
			) : (
				<div className="mt-4">
					{activeTab === "proxy-hosts" ? (
						<ProxyHostsTable data={proxyHosts.data ?? []} isFetching={proxyHosts.isFetching} />
					) : null}
					{activeTab === "redirection-hosts" ? (
						<RedirectionHostsTable
							data={redirectionHosts.data ?? []}
							isFetching={redirectionHosts.isFetching}
						/>
					) : null}
					{activeTab === "streams" ? (
						<StreamsTable data={streams.data ?? []} isFetching={streams.isFetching} />
					) : null}
					{activeTab === "dead-hosts" ? (
						<DeadHostsTable data={deadHosts.data ?? []} isFetching={deadHosts.isFetching} />
					) : null}
					{activeTab === "certificates" ? (
						<CertificatesTable data={certificates.data ?? []} isFetching={certificates.isFetching} />
					) : null}
					{activeTab === "access-lists" ? (
						<AccessTable data={accessLists.data ?? []} isFetching={accessLists.isFetching} />
					) : null}
				</div>
			)}
		</div>
	);
};

const UserDetail = () => {
	const { userId } = useParams();
	return (
		<HasPermission section={ADMIN} permission={VIEW} pageLoading loadingNoLogo>
			<UserDetailInner userId={userId} />
		</HasPermission>
	);
};

export default UserDetail;
