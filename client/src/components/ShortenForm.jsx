import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { shorten } from '../api.js';

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setResult(null); setCopied(false); setLoading(true);
    try {
      setResult(await shorten(url.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  }

  return (
    <section>
      <h2>Paste a long link</h2>
      <form onSubmit={handleSubmit} className="row">
        <input
          type="url"
          required
          placeholder="https://example.com/a/very/long/link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Shortening...' : 'Shorten link'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <QRCodeSVG value={result.shortUrl} size={112} />
          <div>
            <a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a>
            <div><button onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
