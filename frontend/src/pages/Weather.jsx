import { useEffect, useState } from "react";

export default function Weather() {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    // New York coordinates: latitude=40.7128, longitude=-74.0060
    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m")
      .then((r) => r.json())
      .then((data) => setTemp(data.current.temperature_2m))
      .catch((error) => console.error("Error fetching weather:", error));
  }, []);

  return (
    <div>
      <h2>Weather (3rd Party API)</h2>
      {temp !== null ? <p>New York: {temp}°C</p> : <p>Loading...</p>}
    </div>
  );
}

