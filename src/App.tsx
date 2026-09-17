import { AppProvider } from './state/AppContext';
import { useApp } from './state/useApp';
import { CountView } from './views/CountView';
import { HistoryDetailView } from './views/HistoryDetailView';
import { HistoryView } from './views/HistoryView';
import { HomeView } from './views/HomeView';
import { RunItView } from './views/RunItView';
import { SessionView } from './views/SessionView';
import { SettingsView } from './views/SettingsView';
import { SettleView } from './views/SettleView';

function Shell() {
  const { view } = useApp();
  switch (view) {
    case 'home':
      return <HomeView />;
    case 'session':
      return <SessionView />;
    case 'count':
      return <CountView />;
    case 'settle':
      return <SettleView />;
    case 'history':
      return <HistoryView />;
    case 'historyDetail':
      return <HistoryDetailView />;
    case 'settings':
      return <SettingsView />;
    case 'runit':
      return <RunItView />;
    default:
      return <HomeView />;
  }
}

function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <Shell />
      </div>
    </AppProvider>
  );
}

export default App;
