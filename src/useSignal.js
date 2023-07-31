import { useState, useEffect, useCallback, useRef } from "react";
import { createSimpleWorkspace } from "./workspace";
export function useSignal() {
  const [sharedSignaler, setSharedSignaler] = useState(null);
  const [localModel, setLocalModel] = useState(0);
  const signalCountRef = useRef(0);
  const signalCountPerSecRef = useRef(0);
  const signalCountIntervalRef = useRef(null);
  useEffect(() => {
    const initializeSignaler = async () => {
      let containerId = window.location.hash.substring(1) || undefined;
      const workspace = await createSimpleWorkspace(containerId, process.env.FLUID_MODE);
      if (containerId === undefined) {
        containerId = workspace.containerId;
        window.location.hash = containerId;
      } else {
        setLocalModel(1);
      }
      workspace.signaler.onSignal("roll", (client, local, value) => {
        setLocalModel(value);
        signalCountRef.current += 1;
      });

      setSharedSignaler(workspace.signaler);
    };
    initializeSignaler();
  }, []);
  
  const roll = useCallback(() => {
    if (sharedSignaler) {
      sharedSignaler.submitSignal("roll", randomString());
    }
  }, [sharedSignaler]);

  useEffect(() => {
    if (sharedSignaler) {
      signalCountIntervalRef.current = setInterval(() => {
        signalCountPerSecRef.current = signalCountRef.current;
        signalCountRef.current = 0;
      }, 1000);
    }
    return () => {
      clearInterval(signalCountIntervalRef.current);
    };
  }, [sharedSignaler]);

  const randomString = () => {
    const randomNumber = Math.floor(Math.random() * 998) + 1;
    return randomNumber.toString();
  };

  return [localModel, roll, signalCountPerSecRef.current];
}
