import { createColumnHelper, type RowData } from "@tanstack/react-table";
import type { Features } from "./features";

/**
 * Creates a shared "select" display column that renders checkboxes in the
 * header (select all) and every row. Requires the rowSelectionFeature to be
 * registered on the table instance (it is, globally, in features.ts).
 */
const createSelectColumn = <TData extends RowData>() => {
	const columnHelper = createColumnHelper<Features, TData>();
	return columnHelper.display({
		id: "select",
		enableSorting: false,
		header: ({ table }: any) => (
			<input
				type="checkbox"
				className="form-check-input m-0"
				aria-label="Select all"
				checked={table.getIsAllRowsSelected()}
				onChange={table.getToggleAllRowsSelectedHandler()}
				onClick={(e) => e.stopPropagation()}
			/>
		),
		cell: ({ row }: any) => (
			<input
				type="checkbox"
				className="form-check-input m-0"
				aria-label={`Select row ${row.original.id ?? ""}`}
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onChange={row.getToggleSelectedHandler()}
				onClick={(e) => e.stopPropagation()}
			/>
		),
		meta: {
			className: "w-1",
		},
	});
};

export { createSelectColumn };
