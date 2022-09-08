import { useEffect, useState } from "react";

const useLocalStorage = <T>(key: string, defaultValue: T | null) => {
  const [value, setValue] = useState<T | null>(null);
  const setLocalStoredValue = (newValue: T | null) => {
    localStorage.setItem(key, JSON.stringify(newValue) ?? null);
    setValue(newValue);
  };
  useEffect(() => {
    const localStoredValue = localStorage.getItem(key);
    if (localStoredValue === null) {
      setLocalStoredValue(defaultValue);
    } else {
      setValue(JSON.parse(localStoredValue));
    }
  }, [key]);
  return [value, setLocalStoredValue] as const;
};

export default useLocalStorage;
