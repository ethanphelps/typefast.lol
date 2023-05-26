import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.scss";
import { getConfig } from "./config";

console.log(`Environment: ${process.env.ENV}`);
console.log(process.env);
console.log("Config: ", getConfig());

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
