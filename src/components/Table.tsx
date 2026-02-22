import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { Paginator } from "primereact/paginator";

interface Product {
  id?: string;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: Date;
  date_end?: Date;
}

export default function CheckboxRowSelectionDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[] | null>(
    null,
  );

  const productsApi = async () => {
    try {
      let res = await axios.get("https://api.artic.edu/api/v1/artworks?page=1");
      setProducts(res.data.data);
      setPagination(res.data.pagination);
      console.log(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    productsApi();
  }, []);

  return (
    <div className="card">
      <DataTable
        value={products}
        selectionMode={"multiple"}
        selection={selectedProducts!}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place_of_origin"></Column>
        <Column field="artist_display" header="Artist_display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date_start"></Column>
        <Column field="date_end" header="Date_end"></Column>
      </DataTable>
    </div>
  );
}
