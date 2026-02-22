import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { useDataFetch } from "../hooks/useDataFetch";
import CustomPaginator from "./Paginator";

interface Product {
  id?: string | number;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: number;
  date_end?: number;
}

export default function Table() {
  const [page, setPage] = useState(1);
  const [first, setFirst] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [deselectedIds, setDeselectedIds] = useState<Record<string, boolean>>({});
  const [bulkCount, setBulkCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectCount, setSelectCount] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: products, pagination, loading, error } = useDataFetch("artworks", page);
  const limit = pagination?.limit ?? 12;

  const isRowSelected = (rowIndex: number, id: string): boolean => {
    const globalIndex = (page - 1) * limit + rowIndex;
    if (deselectedIds[id]) return false;
    if (globalIndex < bulkCount) return true;
    return !!selectedIds[id];
  };

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    setFirst(e.first);
    setPage(e.page + 1);
  };

  const toggleRow = (id: string, rowIndex: number) => {
    const currentlySelected = isRowSelected(rowIndex, id);
    const globalIndex = (page - 1) * limit + rowIndex;
    const inBulkRange = globalIndex < bulkCount;

    if (currentlySelected) {
      if (inBulkRange) {
        setDeselectedIds((prev) => ({ ...prev, [id]: true }));
      } else {
        setSelectedIds((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    } else {
      if (inBulkRange) {
        setDeselectedIds((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } else {
        setSelectedIds((prev) => ({ ...prev, [id]: true }));
      }
    }
  };

  const toggleAll = () => {
    const allSelected = products.every((p, i) => isRowSelected(i, String(p.id)));
    const newDeselected = { ...deselectedIds };
    const newSelected = { ...selectedIds };

    products.forEach((p, i) => {
      const id = String(p.id);
      const globalIndex = (page - 1) * limit + i;

      if (allSelected) {
        if (globalIndex < bulkCount) {
          newDeselected[id] = true;
        } else {
          delete newSelected[id];
        }
      } else {
        if (globalIndex < bulkCount) {
          delete newDeselected[id];
        } else {
          newSelected[id] = true;
        }
      }
    });

    setDeselectedIds(newDeselected);
    setSelectedIds(newSelected);
  };

  const handleBulkSelect = () => {
    const count = parseInt(selectCount);
    if (!count || count <= 0) return;
    setBulkCount(count);
    setSelectedIds({});
    setDeselectedIds({});
    setShowDropdown(false);
    setSelectCount("");
  };

  const totalSelected =
    Math.max(0, Math.min(bulkCount, pagination?.total ?? bulkCount) - Object.keys(deselectedIds).length) +
    Object.keys(selectedIds).length;

  const allCurrentSelected =
    products.length > 0 && products.every((p, i) => isRowSelected(i, String(p.id)));

  const selectionHeader = () => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px" }}>
      <input
        type="checkbox"
        checked={allCurrentSelected}
        onChange={toggleAll}
        style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#0d6efd" }}
      />
      <span
        onClick={(e) => { e.stopPropagation(); setShowDropdown((v) => !v); }}
        style={{ cursor: "pointer", color: "#adb5bd", fontSize: "10px", userSelect: "none" }}
      >
        ▼
      </span>

      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute", top: "30px", left: "0", zIndex: 9999,
            backgroundColor: "#fff", border: "1px solid #dee2e6",
            borderRadius: "6px", padding: "14px", width: "230px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "13px", color: "#333" }}>
            Select Multiple Rows
          </p>
          <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#888" }}>
            Enter number of rows to select across all pages
          </p>
          <input
            type="number"
            placeholder="e.g. 20"
            value={selectCount}
            onChange={(e) => setSelectCount(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleBulkSelect(); }}
            style={{
              width: "100%", padding: "6px 8px", border: "1px solid #dee2e6",
              borderRadius: "4px", fontSize: "13px", outline: "none",
              boxSizing: "border-box",
            }}
            autoFocus
          />
          <button
            onClick={handleBulkSelect}
            style={{
              marginTop: "8px", width: "100%", padding: "6px",
              backgroundColor: "#0d6efd", color: "#fff",
              border: "none", borderRadius: "4px",
              cursor: "pointer", fontSize: "13px",
            }}
          >
            Select
          </button>
          <button
            onClick={() => setShowDropdown(false)}
            style={{
              marginTop: "6px", width: "100%", padding: "5px",
              background: "transparent", border: "1px solid #dee2e6",
              borderRadius: "4px", cursor: "pointer", fontSize: "12px", color: "#888",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const checkboxBody = (row: Product, options: { rowIndex: number }) => {
    const id = String(row.id);
    const isChecked = isRowSelected(options.rowIndex, id);
    return (
      <div
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleRow(id, options.rowIndex); }}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {}}
          style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#0d6efd", pointerEvents: "none" }}
        />
      </div>
    );
  };

  const inscriptionBody = (row: Product) => row.inscriptions ?? "N/A";

  const headerStyle = {
    backgroundColor: "#fff", color: "#555", fontSize: "11px",
    fontWeight: "700" as const, letterSpacing: "0.8px", padding: "12px 16px",
  };

  const bodyStyle = {
    fontSize: "13px", color: "#555",
    borderBottom: "1px solid #e9ecef", padding: "10px 16px",
  };

  const rowClassName = (row: Product, options: { rowIndex: number }) =>
    isRowSelected(options.rowIndex ?? 0, String(row.id)) ? "selected-row" : "";

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <style>{`
        .selected-row td { background-color: #e8f0fe !important; }
        .selected-row:hover td { background-color: #dce7fd !important; }
        .p-datatable .p-datatable-tbody > tr:not(.selected-row):hover td {
          background-color: #f5f5f5 !important;
        }
      `}</style>

      <div
        style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}
        onClick={(e) => {
          if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setShowDropdown(false);
          }
        }}
      >
        <div style={{
          padding: "6px 16px", backgroundColor: "#fff",
          borderBottom: "1px solid #e9ecef", fontSize: "13px",
          flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", minHeight: "36px",
        }}>
          <span style={{ color: totalSelected > 0 ? "#333" : "#adb5bd" }}>
            Selected: <strong>{totalSelected}</strong> rows
          </span>
          {totalSelected > 0 && (
            <button
              onClick={() => { setSelectedIds({}); setDeselectedIds({}); setBulkCount(0); }}
              style={{
                background: "transparent", border: "1px solid #dee2e6", color: "#888",
                padding: "2px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px",
              }}
            >
              Clear All
            </button>
          )}
        </div>

        <DataTable
          key={`${page}-${Object.keys(selectedIds).join(",")}-${Object.keys(deselectedIds).join(",")}-${bulkCount}`}
          value={products}
          dataKey="id"
          loading={loading}
          scrollable
          scrollHeight="flex"
          rowClassName={(row: Product, options: any) => rowClassName(row, options)}
          style={{ flex: 1, overflow: "hidden" }}
          tableStyle={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Column
            header={selectionHeader}
            body={(row: Product, options: any) => checkboxBody(row, options)}
            headerStyle={{ width: "4rem", backgroundColor: "#fff", padding: "12px 16px", borderBottom: "2px solid #e9ecef" }}
            bodyStyle={{ padding: "10px 16px", borderBottom: "1px solid #e9ecef" }}
          />
          <Column field="title" header="TITLE" style={{ minWidth: "14rem" }}
            headerStyle={headerStyle} bodyStyle={{ ...bodyStyle, fontWeight: "600", color: "#222" }} />
          <Column field="place_of_origin" header="PLACE OF ORIGIN" style={{ minWidth: "8rem" }}
            headerStyle={headerStyle} bodyStyle={bodyStyle} />
          <Column field="artist_display" header="ARTIST" style={{ minWidth: "14rem" }}
            headerStyle={headerStyle} bodyStyle={bodyStyle} />
          <Column field="inscriptions" header="INSCRIPTIONS" body={inscriptionBody} style={{ minWidth: "12rem" }}
            headerStyle={headerStyle} bodyStyle={bodyStyle} />
          <Column field="date_start" header="START DATE" style={{ width: "7rem" }}
            headerStyle={headerStyle} bodyStyle={bodyStyle} />
          <Column field="date_end" header="END DATE" style={{ width: "7rem" }}
            headerStyle={headerStyle} bodyStyle={bodyStyle} />
        </DataTable>

        {pagination && (
          <div style={{ flexShrink: 0 }}>
            <CustomPaginator pagination={pagination} first={first} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    </>
  );
}