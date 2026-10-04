import { useState } from 'react';
import ShortenForm from './components/ShortenForm.jsx';
import LinksTable from './components/LinksTable.jsx';
import Analytics from './components/Analytics.jsx';

export default function App() {
  const [view, setView] = useState('home'); // home | links | stats
  const [code, setCode] = useState(null);

  const openStats = (c) => { setCode(c); setView('stats'); };

  return (
    <div className="app">
      <header>
        <h1>Snip</h1>
        <nav>
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>New link</button>
          <button className={view === 'links' ? 'active' : ''} onClick={() => setView('links')}>My links</button>
        </nav>
      </header>
      <main>
        {view === 'home' && <ShortenForm />}
        {view === 'links' && <LinksTable onOpenStats={openStats} />}
        {view === 'stats' && <Analytics code={code} onBack={() => setView('links')} />}
      </main>
    </div>
  );
}
