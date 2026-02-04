import { createRoot } from "react-dom/client";
import "./index.css";
import "@/lib/translation/i18n.ts";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
