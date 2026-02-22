import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export const useDataFetch = (endpoint: string, page = 1) => {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/${endpoint}?page=${page}`);
        const json = await res.json();
        setData(json.data);
        setPagination(json.pagination);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [endpoint, page]);

  return { data, pagination, loading, error }; 
};