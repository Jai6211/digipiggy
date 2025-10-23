import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching backend:", err));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🚀 DigiPiggy Frontend</h1>
      <p>This page is connected to your Node.js backend.</p>

      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading from backend...</p>
      )}
    </div>
  );
}

export default App;