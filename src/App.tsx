import { Router, Route } from '@solidjs/router';
import { Home } from './pages/Home';
import { WorldMap } from './pages/WorldMap';
import { World } from './pages/World';
import { Class } from './pages/Class';
import { Step } from './pages/Step';

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/worldmap/:worldMapId?" component={WorldMap} />
      <Route path="/:worldId/:classId/:stepId" component={Step} />
      <Route path="/:worldId/:classId" component={Class} />
      <Route path="/:worldId" component={World} />
    </Router>
  );
}

