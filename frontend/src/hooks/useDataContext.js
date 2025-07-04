// src/hooks/useDataContext.js
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

const useDataContext = () => useContext(DataContext);

export default useDataContext;
