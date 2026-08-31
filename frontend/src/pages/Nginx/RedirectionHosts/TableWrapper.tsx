import { IconHelp, IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import { bulkHosts, deleteRedirectionHost, toggleRedirectionHost } from "src/api/backend";
import { Button, HasPermission, LoadingPage } from "src/components";
import type { BulkAction } from "src/components/Table";
import { useRedirectionHosts, useUser } from "src/hooks";
import { intl, T } from "src/locale";
import { showDeleteConfirmModal, showHelpModal, showRedirectionHostModal } from "src/modals";
import { isAdmin, MANAGE, REDIRECTION_HOSTS, USER, VISIBILITY } from "src/modules/Permissions";
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
	const { isFetching, isLoading, isError, error, data } = useRedirectionHosts(
		["owner", "certificate"],
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
			const results = await bulkHosts("redirection-hosts", action, ids);
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
			queryClient.invalidateQueries({ queryKey: ["redirection-hosts"] });
		}
	};

	const handleBulkAction = (action: BulkAction, ids: number[]) => {
		if (action === "delete") {
			showDeleteConfirmModal({
				title: <T id="bulk.delete" />,
				onConfirm: () => performBulk(action, ids),
				invalidations: [["redirection-hosts"]],
				children: (
					<T id="bulk.delete-confirm" data={{ count: ids.length }} tData={{ object: "redirection-hosts" }} />
				),
			});
		} else {
			performBulk(action, ids);
		}
	};

	const handleDelete = async (id: number) => {
		await deleteRedirectionHost(id);
		showObjectSuccess("redirection-host", "deleted");
	};

	const handleDisableToggle = async (id: number, enabled: boolean) => {
		await toggleRedirectionHost(id, enabled);
		queryClient.invalidateQueries({ queryKey: ["redirection-hosts"] });
		queryClient.invalidateQueries({ queryKey: ["redirection-host", id] });
		showObjectSuccess("redirection-host", enabled ? "enabled" : "disabled");
	};

	let filtered = null;
	if (search && data) {
		filtered = data?.filter((item) => {
			return (
				item.domainNames.some((domain: string) => domain.toLowerCase().includes(search)) ||
				item.forwardDomainName.toLowerCase().includes(search)
			);
		});
	} else if (search !== "") {
		// this can happen if someone deletes the last item while searching
		setSearch("");
	}

	return (
		<div className="card mt-4">
			<div className="card-status-top bg-yellow" />
			<div className="card-table">
				<div className="card-header">
					<div className="row w-full">
						<div className="col">
							<h2 className="mt-1 mb-0">
								<T
									id={all ? "view.all-objects" : "view.mine-objects"}
									tData={{ object: "redirection-hosts" }}
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
								<Button size="sm" onClick={() => showHelpModal("RedirectionHosts", "yellow")}>
									<IconHelp size={20} />
								</Button>
								{canViewAll ? (
									<Link
										to={all ? "/nginx/redirection" : "/nginx/redirection/all"}
										className="btn btn-sm btn-outline-yellow"
									>
										<T
											id={all ? "view.mine-objects" : "view.all-objects"}
											tData={{ object: "redirection-hosts" }}
										/>
									</Link>
								) : null}
								<HasPermission section={REDIRECTION_HOSTS} permission={MANAGE} hideError>
									{data?.length ? (
										<Button
											size="sm"
											className="btn-yellow"
											onClick={() => showRedirectionHostModal("new")}
										>
											<T id="object.add" tData={{ object: "redirection-host" }} />
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
					onEdit={(id: number) => showRedirectionHostModal(id)}
					onDelete={(id: number) =>
						showDeleteConfirmModal({
							title: <T id="object.delete" tData={{ object: "redirection-host" }} />,
							onConfirm: () => handleDelete(id),
							invalidations: [["redirection-hosts"], ["redirection-host", id]],
							children: <T id="object.delete.content" tData={{ object: "redirection-host" }} />,
						})
					}
					onDisableToggle={handleDisableToggle}
					onNew={() => showRedirectionHostModal("new")}
					onBulkAction={handleBulkAction}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					isBulkBusy={isBulkBusy}
				/>
			</div>
		</div>
	);
}
