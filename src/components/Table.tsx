import React, { useState, useRef } from "react";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionVersion, setSelectionVersion] = useState(0); // ✅ force re-render
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectCount, setSelectCount] = useState("");
  const [isLoadingSelect, setIsLoadingSelect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: products, pagination, loading, error } = useDataFetch("artworks", page);

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    setFirst(e.first);
    setPage(e.page + 1);
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
    setSelectionVersion((v) => v + 1);
  };

  const toggleAll = () => {
    const allCurrentIds = products.map((p) => String(p.id));
    const allSelected = allCurrentIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (allSelected) {
        allCurrentIds.forEach((id) => updated.delete(id));
      } else {
        allCurrentIds.forEach((id) => updated.add(id));
      }
      return updated;
    });
    setSelectionVersion((v) => v + 1); 
  };


  const handleBulkSelect = async () => {
    const count = parseInt(selectCount);
    if (!count || count <= 0) return;

    setIsLoadingSelect(true);
    const BASE_URL = import.meta.env.VITE_AIC_API_URL;
    const freshIds = new Set<string>();

    try {
      let fetchPage = 1;
      while (freshIds.size < count) {
        const res = await fetch(`${BASE_URL}/artworks?page=${fetchPage}`);
        const json = await res.json();
        const items: Product[] = json.data;

        for (const item of items) {
          if (freshIds.size >= count) break;
          if (item.id) freshIds.add(String(item.id));
        }

        if (fetchPage >= json.pagination.total_pages) break;
        fetchPage++;
      }

      setSelectedIds(new Set(freshIds));
      setSelectionVersion((v) => v + 1); // ✅ force re-render
    } catch (err) {
      console.error("Bulk select failed", err);
    } finally {
      setIsLoadingSelect(false);
      setShowDropdown(false);
      setSelectCount("");
    }
  };

  const allCurrentSelected =
    products.length > 0 && products.every((p) => selectedIds.has(String(p.id)));

  const selectionHeader = () => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px" }}>
      <input
        key={`hdr-${selectionVersion}`} 
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
            position: "absolute",
            top: "30px",
            left: "0",
            zIndex: 9999,
            backgroundColor: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            padding: "14px",
            width: "230px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "13px", color: "#333" }}>
            Select Multiple Rows
          </p>
          <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#888" }}>
            Enter number of rows to select across all pages
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="number"
              placeholder="e.g. 20"
              value={selectCount}
              onChange={(e) => setSelectCount(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleBulkSelect(); }}
              style={{
                flex: 1,
                padding: "6px 8px",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "13px",
                outline: "none",
              }}
              autoFocus
            />
            <button
              onClick={handleBulkSelect}
              disabled={isLoadingSelect}
              style={{
                padding: "6px 14px",
                backgroundColor: "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: isLoadingSelect ? "not-allowed" : "pointer",
                fontSize: "13px",
                opacity: isLoadingSelect ? 0.7 : 1,
              }}
            >
              {isLoadingSelect ? "..." : "Select"}
            </button>
          </div>
          <button
            onClick={() => setShowDropdown(false)}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "5px",
              background: "transparent",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#888",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const checkboxBody = (row: Product) => {
    const id = String(row.id);
    return (
      <input
        key={`chk-${id}-${selectionVersion}`}
        type="checkbox"
        checked={selectedIds.has(id)}
        onChange={() => toggleRow(id)}
        style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#0d6efd" }}
      />
    );
  };

  const inscriptionBody = (row: Product) => row.inscriptions ?? "N/A";

  const headerStyle = {
    backgroundColor: "#1e1e2d",
    color: "#adb5bd",
    fontSize: "11px",
    fontWeight: "700" as const,
    letterSpacing: "0.8px",
    borderBottom: "2px solid #444",
    padding: "12px 16px",
  };

  const bodyStyle = {
    fontSize: "13px",
    color: "#555",
    borderBottom: "1px solid #e9ecef",
    padding: "10px 16px",
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
      onClick={(e) => {
        if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setShowDropdown(false);
        }
      }}
    >
      {selectedIds.size > 0 && (
        <div
          style={{
            padding: "8px 20px",
            backgroundColor: "#0d6efd",
            color: "#fff",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span>✓ {selectedIds.size} item(s) selected across all pages</span>
          <button
            onClick={() => { setSelectedIds(new Set()); setSelectionVersion((v) => v + 1); }}
            style={{
              background: "transparent",
              border: "1px solid #fff",
              color: "#fff",
              padding: "2px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Clear All
          </button>
        </div>
      )}

      <DataTable
        value={products}
        dataKey="id"
        loading={loading}
        scrollable
        scrollHeight="flex"
        style={{ flex: 1, overflow: "hidden" }}
        tableStyle={{ width: "100%", borderCollapse: "collapse" }}
        pt={{
          thead: { style: { backgroundColor: "#1e1e2d" } },
          headerRow: { style: { backgroundColor: "#1e1e2d" } },
        }}
      >
        <Column
          header={selectionHeader}
          body={checkboxBody}
          headerStyle={{ width: "4rem", backgroundColor: "#1e1e2d", borderBottom: "2px solid #444", padding: "12px 16px" }}
          bodyStyle={{ padding: "10px 16px", borderBottom: "1px solid #e9ecef" }}
        />
        <Column field="title" header="TITLE"
          style={{ minWidth: "14rem" }}
          headerStyle={headerStyle}
          bodyStyle={{ ...bodyStyle, fontWeight: "600", color: "#222" }}
        />
        <Column field="place_of_origin" header="PLACE OF ORIGIN"
          style={{ minWidth: "8rem" }}
          headerStyle={headerStyle}
          bodyStyle={bodyStyle}
        />
        <Column field="artist_display" header="ARTIST"
          style={{ minWidth: "14rem" }}
          headerStyle={headerStyle}
          bodyStyle={bodyStyle}
        />
        <Column field="inscriptions" header="INSCRIPTIONS"
          body={inscriptionBody}
          style={{ minWidth: "12rem" }}
          headerStyle={headerStyle}
          bodyStyle={bodyStyle}
        />
        <Column field="date_start" header="START DATE"
          style={{ width: "7rem" }}
          headerStyle={headerStyle}
          bodyStyle={bodyStyle}
        />
        <Column field="date_end" header="END DATE"
          style={{ width: "7rem" }}
          headerStyle={headerStyle}
          bodyStyle={bodyStyle}
        />
      </DataTable>

      {pagination && (
        <div style={{ flexShrink: 0 }}>
          <CustomPaginator
            pagination={pagination}
            first={first}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}