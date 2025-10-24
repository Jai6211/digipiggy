import { useEffect, useState } from "react";

export default function Weather() {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current=temperature_2m")
      .then((r) => r.json())
      .then((data) => setTemp(data.current.temperature_2m));
  }, []);

  return (
    <div>
      <h2>Weather (3rd Party API)</h2>
      {temp ? <p>Hyderabad: {temp}°C</p> : <p>Loading...</p>}
    </div>
  );
}
