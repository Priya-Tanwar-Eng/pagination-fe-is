import React from "react";
import { Paginator } from "primereact/paginator";
import type { PaginatorPageChangeEvent } from "primereact/paginator";

interface PaginationData {
  total: number;
  limit: number;
  total_pages: number;
  current_page: number;
}

interface Props {
  pagination: PaginationData;
  first: number;
  onPageChange: (e: PaginatorPageChangeEvent) => void;
}

export default function CustomPaginator({ pagination, first, onPageChange }: Props) {
  const template = {
    layout: "PrevPageLink PageLinks NextPageLink",

    PrevPageLink: (options: any) => (
      <button
        onClick={options.onClick}
        disabled={options.disabled}
        style={{
          padding: "6px 14px",
          border: "1px solid #dee2e6",
          borderRadius: "4px 0 0 4px",
          background: options.disabled ? "#f8f9fa" : "#fff",
          color: options.disabled ? "#adb5bd" : "#333",
          cursor: options.disabled ? "not-allowed" : "pointer",
          fontSize: "13px",
        }}
      >
        Previous
      </button>
    ),

    PageLinks: (options: any) => {
      const isActive = options.page === options.currentPage;
      return (
        <button
          onClick={options.onClick}
          style={{
            padding: "6px 12px",
            border: "1px solid #dee2e6",
            borderLeft: "none",
            background: isActive ? "#0d6efd" : "#fff",
            color: isActive ? "#fff" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: isActive ? "600" : "400",
          }}
        >
          {options.page + 1}
        </button>
      );
    },

    NextPageLink: (options: any) => (
      <button
        onClick={options.onClick}
        disabled={options.disabled}
        style={{
          padding: "6px 14px",
          border: "1px solid #dee2e6",
          borderLeft: "none",
          borderRadius: "0 4px 4px 0",
          background: options.disabled ? "#f8f9fa" : "#fff",
          color: options.disabled ? "#adb5bd" : "#333",
          cursor: options.disabled ? "not-allowed" : "pointer",
          fontSize: "13px",
        }}
      >
        Next
      </button>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        backgroundColor: "#fff",
        borderTop: "1px solid #dee2e6",
        fontSize: "13px",
        color: "#555",
      }}
    >
      <span>
        Showing <strong>{first + 1}</strong> to{" "}
        <strong>{Math.min(first + pagination.limit, pagination.total)}</strong> of{" "}
        <strong>{pagination.total.toLocaleString()}</strong> entries
      </span>

      <Paginator
        template={template}
        first={first}
        rows={pagination.limit}
        totalRecords={pagination.total}
        onPageChange={onPageChange}
        style={{ padding: 0, background: "transparent" }}
      />
    </div>
  );
}