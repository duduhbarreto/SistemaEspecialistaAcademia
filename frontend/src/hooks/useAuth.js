// filepath: client/src/hooks/useExampleHook.js
import { useState, useEffect } from 'react';

const useExampleHook = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Example effect: Log the value whenever it changes
    console.log('Value changed:', value);
  }, [value]);

  const updateValue = (newValue) => {
    setValue(newValue);
  };

  return [value, updateValue];
};

export default useExampleHook;