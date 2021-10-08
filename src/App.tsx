import React from 'react';
import './App.css';
import Dropzone from './components/Dropzone';

function App() {
  return (
    <div className="App">
      <Dropzone onSubmit={files => console.log(files)} />
    </div>
  );
}

export default App;
