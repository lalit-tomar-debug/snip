import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../api.js';

export default function Analytics({ code, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics(code).then(setData).catch((e) => setError(e.message));
  }, [code]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <section>
      <button onClick={onBack}>Back to my links</button>
      <h2>{data.link.shortUrl}</h2>
      <p className="muted">{data.link.originalUrl}</p>
      <p><strong>{data.link.clicks}</strong> total clicks</p>

      {data.byDay.length === 0 ? (
        <p>No clicks yet. Open the short link and refresh this page.</p>
      ) : (
        <>
          <h3>Clicks per day</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#1d4ed8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <h3>Clicks by browser</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byBrowser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
