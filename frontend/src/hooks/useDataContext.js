// src/hooks/useDataContext.js
import { useContext } from "react";
import { DataContext } from "../context/dataContext";

const useDataContext = () => useContext(DataContext);

export default useDataContext;
