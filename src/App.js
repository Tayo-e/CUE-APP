import logo from './logo.svg';
import './App.css';
import CueSvg1 from './CueLogo1.svg';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={CueSvg1} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
