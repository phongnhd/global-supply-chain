"use client";

import { useState } from "react";

export default function Upload() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "http://localhost:5000/api/agent/process-document",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log("AI RESULT:", data);

      if (data.success) {
        setForm(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleUpload}
      />

      {loading && <p>Processing AI document...</p>}

      <pre>{JSON.stringify(form, null, 2)}</pre>
    </div>
  );
}