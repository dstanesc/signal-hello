import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSignal } from "./useSignal";
import "./App.css";

function Cell(props) {
  return (
    <button className="dice" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Ops(props) {
  return (
    <button className="ops" onClick={props.onClick}>
      {props.value} ops/sec
    </button>
  );
}

function App() {
  const [localModel, roll, perSec] = useSignal();

  const [rollToggle, setRollToggle] = useState(false);
  const [rollingInterval, setRollingInterval] = useState(null);

  useEffect(() => {
    if (rollToggle) {
      const interval = setInterval(roll, 1);
      setRollingInterval(interval);
    } else {
      clearInterval(rollingInterval);
      setRollingInterval(null);
    }
    return () => {
      clearInterval(rollingInterval);
    };
  }, [rollToggle]);

  const rollClass = () => {
    return rollToggle ? "roll-active" : "roll-inactive";
  };

  const toggleRolling = () => {
    setRollToggle((prevToggle) => !prevToggle);
  };

  return (
    <div className="App">
      <div className="dices">
        <Cell
          value={localModel}
        />
        <Ops
          value={perSec}
        />
      </div>
      <br />
      <br />
      <span className={rollClass()} onClick={() => toggleRolling()}>
        Roll
      </span>
    </div>
  );
}

export default App;
