import {
	columnVisibilityFeature,
	createSortedRowModel,
	metaHelper,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";

interface ColumnMeta {
	className?: string;
}

interface TableMeta {
	isFetching?: boolean;
}

/**
 * Shared TanStack Table v9 feature registration for every table in the app.
 * Sorting and column visibility are used (or their APIs are called
 * unconditionally, e.g. `getVisibleFlatColumns`/`getVisibleCells`) by the
 * shared TableLayout/TableHeader/TableBody/EmptyData components, so every
 * table instance must register them even when a particular table doesn't
 * wire up controlled sorting state itself.
 *
 * Row selection is registered globally as well; tables that don't render the
 * selection column simply never toggle it.
 */
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	columnVisibilityFeature,
	rowSelectionFeature,
	columnMeta: metaHelper<ColumnMeta>(),
	tableMeta: metaHelper<TableMeta>(),
});

type Features = typeof features;

export { type ColumnMeta, type Features, features, type TableMeta };
