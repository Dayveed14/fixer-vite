import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "./BookingsDataTable.css";

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const BookingsDataTable = ({ bookings = [] }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sorting, setSorting] = useState([
    { id: "booking_date", desc: true },
  ]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "booking_reference",
        header: "Reference",
        cell: ({ getValue }) => (
          <span className="bookings-reference">
            {formatValue(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "customer_name",
        header: "Customer",
        cell: ({ getValue }) => formatValue(getValue()),
      },
      {
        accessorKey: "support_type",
        header: "Support Type",
        cell: ({ getValue }) => {
          const value = getValue();

          return SUPPORT_TYPE_LABELS[value] || formatValue(value);
        },
      },
      {
        accessorKey: "booking_date",
        header: "Date",
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId);
          const b = rowB.getValue(columnId);

          return String(a ?? "").localeCompare(String(b ?? ""));
        },
        cell: ({ getValue }) => formatValue(getValue()),
      },
      {
        accessorKey: "booking_time",
        header: "Time",
        cell: ({ getValue }) => formatValue(getValue()),
      },
      {
        accessorKey: "technician_name",
        header: "Technician",
        cell: ({ getValue }) =>
          getValue() || (
            <span className="pending-tech">Unassigned</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() || "Unknown";

          return (
            <span
              className={`booking-status ${String(status)
                .replace(/\s+/g, "")
                .toLowerCase()}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ getValue }) => {
          const status = getValue() || "Pending";

          return (
            <span
              className={`payment-status ${String(status)
                .replace(/\s+/g, "")
                .toLowerCase()}`}
            >
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(booking.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "all" ||
        String(booking.payment_status || "pending").toLowerCase() ===
          paymentFilter.toLowerCase();

      return matchesStatus && matchesPayment;
    });
  }, [bookings, statusFilter, paymentFilter]);

  const table = useReactTable({
    data: filteredBookings,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const filteredCount = table.getFilteredRowModel().rows.length;

  const firstItem =
    filteredCount === 0 ? 0 : currentPage * pageSize + 1;

  const lastItem = Math.min(
    (currentPage + 1) * pageSize,
    filteredCount
  );

  const resetPage = () => {
    table.setPageIndex(0);
  };

  return (
    <div className="bookings-datatable">
      <div className="bookings-datatable-toolbar">
        <div className="bookings-datatable-search">
          <input
            type="search"
            placeholder="Search bookings..."
            aria-label="Search bookings"
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              resetPage();
            }}
          />
        </div>

        <div className="bookings-datatable-filters">
          <select
            aria-label="Filter by booking status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              resetPage();
            }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            aria-label="Filter by payment status"
            value={paymentFilter}
            onChange={(event) => {
              setPaymentFilter(event.target.value);
              resetPage();
            }}
          >
            <option value="all">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bookings-datatable-wrapper">
        <table className="bookings-datatable-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="bookings-sort-button"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${String(
                          header.column.columnDef.header
                        )}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                        <span className="bookings-sort-indicator">
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted()] ?? " ↕"}
                        </span>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="bookings-datatable-empty"
                >
                  {bookings.length === 0
                    ? "No bookings available."
                    : "No bookings match your search or filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bookings-datatable-footer">
        <div className="bookings-datatable-summary">
          Showing {firstItem}–{lastItem} of {filteredCount} bookings
          {filteredCount !== bookings.length &&
            ` (${bookings.length} total)`}
        </div>

        <div className="bookings-datatable-pagination">
          <label>
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => {
                table.setPageSize(Number(event.target.value));
                table.setPageIndex(0);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>

          <span className="bookings-page-number">
            Page {pageCount === 0 ? 0 : currentPage + 1} of {pageCount}
          </span>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsDataTable;
