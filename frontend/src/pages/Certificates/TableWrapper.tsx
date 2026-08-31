import { IconHelp, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import { deleteCertificate, downloadCertificate } from "src/api/backend";
import { Button, HasPermission, LoadingPage } from "src/components";
import { useCertificates, useUser } from "src/hooks";
import { T } from "src/locale";
import {
	showCustomCertificateModal,
	showDeleteConfirmModal,
	showDNSCertificateModal,
	showHelpModal,
	showHTTPCertificateModal,
	showRenewCertificateModal,
} from "src/modals";
import { CERTIFICATES, isAdmin, MANAGE, USER, VISIBILITY } from "src/modules/Permissions";
import { showError, showObjectSuccess } from "src/notifications";
import Table from "./Table";

interface Props {
	/** Render the "all objects" variant, showing certificates of every user */
	all?: boolean;
}

export default function TableWrapper({ all }: Props) {
	const [search, setSearch] = useState("");
	const { data: currentUser } = useUser("me");
	const { isFetching, isLoading, isError, error, data } = useCertificates(
		["owner", "dead_hosts", "proxy_hosts", "redirection_hosts", "streams"],
		{},
		{ ownerUserId: all ? undefined : "me" },
	);

	if (isLoading) {
		return <LoadingPage />;
	}

	if (isError) {
		return <Alert variant="danger">{error?.message || "Unknown error"}</Alert>;
	}

	// Only users that are allowed to see everything (admins or visibility=all)
	// can switch between their own items and all items
	const canViewAll = isAdmin(currentUser?.roles) || currentUser?.permissions?.[VISIBILITY] === USER;

	const handleDelete = async (id: number) => {
		await deleteCertificate(id);
		showObjectSuccess("certificate", "deleted");
	};

	const handleDownload = async (id: number) => {
		try {
			await downloadCertificate(id);
		} catch (err: any) {
			showError(err.message);
		}
	};

	let filtered = null;
	if (search && data) {
		filtered = data?.filter(
			(item) =>
				item.domainNames.some((domain: string) => domain.toLowerCase().includes(search)) ||
				item.niceName.toLowerCase().includes(search),
		);
	} else if (search !== "") {
		// this can happen if someone deletes the last item while searching
		setSearch("");
	}

	return (
		<div className="card mt-4">
			<div className="card-status-top bg-pink" />
			<div className="card-table">
				<div className="card-header">
					<div className="row w-full">
						<div className="col">
							<h2 className="mt-1 mb-0">
								<T
									id={all ? "view.all-objects" : "view.mine-objects"}
									tData={{ object: "certificates" }}
								/>
							</h2>
						</div>
						<div className="col-md-auto col-sm-12">
							<div className="ms-auto d-flex flex-wrap btn-list">
								{data?.length ? (
									<div className="input-group input-group-flat w-auto">
										<span className="input-group-text input-group-text-sm">
											<IconSearch size={16} />
										</span>
										<input
											id="advanced-table-search"
											type="text"
											className="form-control form-control-sm"
											autoComplete="off"
											onChange={(e: any) => setSearch(e.target.value.toLowerCase().trim())}
										/>
									</div>
								) : null}
								<Button size="sm" onClick={() => showHelpModal("Certificates", "pink")}>
									<IconHelp size={20} />
								</Button>
								{canViewAll ? (
									<Link
										to={all ? "/certificates" : "/certificates/all"}
										className="btn btn-sm btn-outline-pink"
									>
										<T
											id={all ? "view.mine-objects" : "view.all-objects"}
											tData={{ object: "certificates" }}
										/>
									</Link>
								) : null}
								<HasPermission section={CERTIFICATES} permission={MANAGE} hideError>
									{data?.length ? (
										<div className="dropdown">
											<button
												type="button"
												className="btn btn-sm dropdown-toggle btn-pink mt-1"
												data-bs-toggle="dropdown"
											>
												<T id="object.add" tData={{ object: "certificate" }} />
											</button>
											<div className="dropdown-menu">
												<a
													className="dropdown-item"
													href="#"
													onClick={(e) => {
														e.preventDefault();
														showHTTPCertificateModal();
													}}
												>
													<T id="lets-encrypt-via-http" />
												</a>
												<a
													className="dropdown-item"
													href="#"
													onClick={(e) => {
														e.preventDefault();
														showDNSCertificateModal();
													}}
												>
													<T id="lets-encrypt-via-dns" />
												</a>
												<div className="dropdown-divider" />
												<a
													className="dropdown-item"
													href="#"
													onClick={(e) => {
														e.preventDefault();
														showCustomCertificateModal();
													}}
												>
													<T id="certificates.custom" />
												</a>
											</div>
										</div>
									) : null}
								</HasPermission>
							</div>
						</div>
					</div>
				</div>
				<Table
					data={filtered ?? data ?? []}
					isFiltered={!!search}
					isFetching={isFetching}
					onRenew={showRenewCertificateModal}
					onDownload={handleDownload}
					onDelete={(id: number) =>
						showDeleteConfirmModal({
							title: <T id="object.delete" tData={{ object: "certificate" }} />,
							onConfirm: () => handleDelete(id),
							invalidations: [["certificates"], ["certificate", id]],
							children: <T id="object.delete.content" tData={{ object: "certificate" }} />,
						})
					}
				/>
			</div>
		</div>
	);
}
