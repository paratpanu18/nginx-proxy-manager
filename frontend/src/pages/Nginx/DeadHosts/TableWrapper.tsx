import { IconHelp, IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import { bulkHosts, deleteDeadHost, toggleDeadHost } from "src/api/backend";
import { Button, HasPermission, LoadingPage } from "src/components";
import type { BulkAction } from "src/components/Table";
import { useDeadHosts, useUser } from "src/hooks";
import { intl, T } from "src/locale";
import { showDeadHostModal, showDeleteConfirmModal, showHelpModal } from "src/modals";
import { DEAD_HOSTS, isAdmin, MANAGE, USER, VISIBILITY } from "src/modules/Permissions";
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
	const { isFetching, isLoading, isError, error, data } = useDeadHosts(
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
			const results = await bulkHosts("dead-hosts", action, ids);
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
			queryClient.invalidateQueries({ queryKey: ["dead-hosts"] });
		}
	};

	const handleBulkAction = (action: BulkAction, ids: number[]) => {
		if (action === "delete") {
			showDeleteConfirmModal({
				title: <T id="bulk.delete" />,
				onConfirm: () => performBulk(action, ids),
				invalidations: [["dead-hosts"]],
				children: <T id="bulk.delete-confirm" data={{ count: ids.length }} tData={{ object: "dead-hosts" }} />,
			});
		} else {
			performBulk(action, ids);
		}
	};

	const handleDelete = async (id: number) => {
		await deleteDeadHost(id);
		showObjectSuccess("dead-host", "deleted");
	};

	const handleDisableToggle = async (id: number, enabled: boolean) => {
		await toggleDeadHost(id, enabled);
		queryClient.invalidateQueries({ queryKey: ["dead-hosts"] });
		queryClient.invalidateQueries({ queryKey: ["dead-host", id] });
		showObjectSuccess("dead-host", enabled ? "enabled" : "disabled");
	};

	let filtered = null;
	if (search && data) {
		filtered = data?.filter((item) => {
			return item.domainNames.some((domain: string) => domain.toLowerCase().includes(search));
		});
	} else if (search !== "") {
		// this can happen if someone deletes the last item while searching
		setSearch("");
	}

	return (
		<div className="card mt-4">
			<div className="card-status-top bg-red" />
			<div className="card-table">
				<div className="card-header">
					<div className="row w-full">
						<div className="col">
							<h2 className="mt-1 mb-0">
								<T
									id={all ? "view.all-objects" : "view.mine-objects"}
									tData={{ object: "dead-hosts" }}
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
								<Button size="sm" onClick={() => showHelpModal("DeadHosts", "red")}>
									<IconHelp size={20} />
								</Button>
								{canViewAll ? (
									<Link
										to={all ? "/nginx/404" : "/nginx/404/all"}
										className="btn btn-sm btn-outline-red"
									>
										<T
											id={all ? "view.mine-objects" : "view.all-objects"}
											tData={{ object: "dead-hosts" }}
										/>
									</Link>
								) : null}
								<HasPermission section={DEAD_HOSTS} permission={MANAGE} hideError>
									{data?.length ? (
										<Button size="sm" className="btn-red" onClick={() => showDeadHostModal("new")}>
											<T id="object.add" tData={{ object: "dead-host" }} />
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
					onEdit={(id: number) => showDeadHostModal(id)}
					onDelete={(id: number) =>
						showDeleteConfirmModal({
							title: <T id="object.delete" tData={{ object: "dead-host" }} />,
							onConfirm: () => handleDelete(id),
							invalidations: [["dead-hosts"], ["dead-host", id]],
							children: <T id="object.delete.content" tData={{ object: "dead-host" }} />,
						})
					}
					onDisableToggle={handleDisableToggle}
					onNew={() => showDeadHostModal("new")}
					onBulkAction={handleBulkAction}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					isBulkBusy={isBulkBusy}
				/>
			</div>
		</div>
	);
}
