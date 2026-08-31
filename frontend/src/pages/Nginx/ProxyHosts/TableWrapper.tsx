import { IconHelp, IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import { bulkHosts, deleteProxyHost, toggleProxyHost } from "src/api/backend";
import { Button, HasPermission, LoadingPage } from "src/components";
import type { BulkAction } from "src/components/Table";
import { useProxyHosts, useUser } from "src/hooks";
import { intl, T } from "src/locale";
import { showDeleteConfirmModal, showHelpModal, showProxyHostModal } from "src/modals";
import { isAdmin, MANAGE, PROXY_HOSTS, USER, VISIBILITY } from "src/modules/Permissions";
import { showError, showObjectSuccess, showSuccess } from "src/notifications";
import Table from "./Table";

interface Props {
	/** Render the "all objects" variant, showing hosts of every user */
	all?: boolean;
}

export default function TableWrapper({ all }: Props) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [isBulkBusy, setIsBulkBusy] = useState(false);
	const { data: currentUser } = useUser("me");
	const { isFetching, isLoading, isError, error, data } = useProxyHosts(
		["owner", "access_list", "certificate"],
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

	const performBulk = async (action: BulkAction, ids: number[]) => {
		setIsBulkBusy(true);
		try {
			const results = await bulkHosts("proxy-hosts", action, ids);
			const failed = results.filter((r) => !r.result);
			if (failed.length === 0) {
				showSuccess(intl.formatMessage({ id: "bulk.success" }, { total: ids.length }));
			} else {
				showError(
					intl.formatMessage(
						{ id: "bulk.partial" },
						{ failed: failed.length, total: ids.length, error: failed[0]?.error ?? "" },
					),
				);
			}
		} catch (err) {
			showError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsBulkBusy(false);
			setRowSelection({});
			queryClient.invalidateQueries({ queryKey: ["proxy-hosts"] });
		}
	};

	const handleBulkAction = (action: BulkAction, ids: number[]) => {
		if (action === "delete") {
			showDeleteConfirmModal({
				title: <T id="bulk.delete" />,
				onConfirm: () => performBulk(action, ids),
				invalidations: [["proxy-hosts"]],
				children: <T id="bulk.delete-confirm" data={{ count: ids.length }} tData={{ object: "proxy-hosts" }} />,
			});
		} else {
			performBulk(action, ids);
		}
	};

	const handleDelete = async (id: number) => {
		await deleteProxyHost(id);
		showObjectSuccess("proxy-host", "deleted");
	};

	const handleDisableToggle = async (id: number, enabled: boolean) => {
		await toggleProxyHost(id, enabled);
		queryClient.invalidateQueries({ queryKey: ["proxy-hosts"] });
		queryClient.invalidateQueries({ queryKey: ["proxy-host", id] });
		showObjectSuccess("proxy-host", enabled ? "enabled" : "disabled");
	};

	let filtered = null;
	if (search && data) {
		filtered = data?.filter(
			(item) =>
				item.domainNames.some((domain: string) => domain.toLowerCase().includes(search)) ||
				item.forwardHost.toLowerCase().includes(search) ||
				`${item.forwardPort}`.includes(search),
		);
	} else if (search !== "") {
		// this can happen if someone deletes the last item while searching
		setSearch("");
	}

	return (
		<div className="card mt-4">
			<div className="card-status-top bg-lime" />
			<div className="card-table">
				<div className="card-header">
					<div className="row w-full">
						<div className="col">
							<h2 className="mt-1 mb-0">
								<T
									id={all ? "view.all-objects" : "view.mine-objects"}
									tData={{ object: "proxy-hosts" }}
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
								<Button size="sm" onClick={() => showHelpModal("ProxyHosts", "lime")}>
									<IconHelp size={20} />
								</Button>
								{canViewAll ? (
									<Link
										to={all ? "/nginx/proxy" : "/nginx/proxy/all"}
										className="btn btn-sm btn-outline-lime"
									>
										<T
											id={all ? "view.mine-objects" : "view.all-objects"}
											tData={{ object: "proxy-hosts" }}
										/>
									</Link>
								) : null}
								<HasPermission section={PROXY_HOSTS} permission={MANAGE} hideError>
									{data?.length ? (
										<Button
											size="sm"
											className="btn-lime"
											onClick={() => showProxyHostModal("new")}
										>
											<T id="object.add" tData={{ object: "proxy-host" }} />
										</Button>
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
					onEdit={(id: number) => showProxyHostModal(id)}
					onDelete={(id: number) => {
						const host = data?.find((h) => h.id === id);
						showDeleteConfirmModal({
							title: <T id="object.delete" tData={{ object: "proxy-host" }} />,
							onConfirm: () => handleDelete(id),
							invalidations: [["proxy-hosts"], ["proxy-host", id]],
							children: (
								<>
									<T id="object.delete.content" tData={{ object: "proxy-host" }} />
									{host?.domainNames?.length ? (
										<div className="mt-2 fw-bold text-break">{host.domainNames.join(", ")}</div>
									) : null}
									{host?.forwardHost ? (
										<div className="mt-1 text-muted small">
											({host.forwardScheme}://{host.forwardHost}:{host.forwardPort})
										</div>
									) : null}
								</>
							),
						});
					}}
					onDisableToggle={handleDisableToggle}
					onNew={() => showProxyHostModal("new")}
					onBulkAction={handleBulkAction}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					isBulkBusy={isBulkBusy}
				/>
			</div>
		</div>
	);
}
