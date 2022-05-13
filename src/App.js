import "./App.css";
import { ServiceStateProvider } from "./context/service";
import { Landing } from "./components";

function App() {
  return (
    <ServiceStateProvider>
      <Landing />
    </ServiceStateProvider>
  );
}

export default App;
