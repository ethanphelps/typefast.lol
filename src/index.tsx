import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.scss";
import { getConfig } from "./config";

console.debug(`Environment: ${process.env.ENV}`);
console.debug(process.env);
console.debug("Config: ", getConfig());

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
