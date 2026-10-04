import { useEffect, useState } from 'react';
import { getLinks, deleteLink } from '../api.js';

export default function LinksTable({ onOpenStats }) {
  const [links, setLinks] = useState(null);
  const [error, setError] = useState('');

  const load = () => getLinks().then(setLinks).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(code) {
    if (!window.confirm('Delete this link? It will stop working.')) return;
    await deleteLink(code);
    load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!links) return <p>Loading...</p>;
  if (links.length === 0) return <p>No links yet. Create your first one in New link.</p>;

  return (
    <section>
      <h2>My links</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Short link</th><th>Original link</th><th>Clicks</th><th></th></tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.shortCode}>
                <td><a href={l.shortUrl} target="_blank" rel="noreferrer">{l.shortCode}</a></td>
                <td className="long">{l.originalUrl}</td>
                <td>{l.clicks}</td>
                <td className="actions">
                  <button onClick={() => onOpenStats(l.shortCode)}>View stats</button>
                  <button className="danger" onClick={() => remove(l.shortCode)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
