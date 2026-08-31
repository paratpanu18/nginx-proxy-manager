import { IconBan, IconPower, IconTrash, IconX } from "@tabler/icons-react";
import cn from "classnames";
import { Button } from "src/components";
import { T } from "src/locale";

type BulkAction = "enable" | "disable" | "delete";

interface Props {
	selectedCount: number;
	/** Card color, used for the highlight background (eg. "lime") */
	color?: string;
	isBusy?: boolean;
	onAction?: (action: BulkAction) => void;
	onClear?: () => void;
}

/**
 * Bar rendered above a table when rows are selected, offering bulk
 * enable / disable / delete actions for the current selection.
 */
function BulkActionsBar({ selectedCount, color, isBusy, onAction, onClear }: Props) {
	if (selectedCount === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				"d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 px-3 border-bottom",
				color ? `bg-${color}-lt` : "bg-azure-lt",
			)}
		>
			<span className="fw-bold">
				<T id="bulk.selected" data={{ count: selectedCount }} />
			</span>
			<div className="d-flex flex-wrap btn-list">
				{onAction ? (
					<>
						<Button size="sm" isLoading={isBusy} onClick={() => onAction("enable")}>
							<IconPower size={16} className="me-1" />
							<T id="bulk.enable" />
						</Button>
						<Button size="sm" isLoading={isBusy} onClick={() => onAction("disable")}>
							<IconBan size={16} className="me-1" />
							<T id="bulk.disable" />
						</Button>
						<Button size="sm" actionType="danger" isLoading={isBusy} onClick={() => onAction("delete")}>
							<IconTrash size={16} className="me-1" />
							<T id="bulk.delete" />
						</Button>
					</>
				) : null}
				{onClear ? (
					<Button size="sm" variant="ghost" onClick={onClear}>
						<IconX size={16} className="me-1" />
						<T id="bulk.clear" />
					</Button>
				) : null}
			</div>
		</div>
	);
}

export { type BulkAction, BulkActionsBar };
