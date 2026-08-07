
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // 한글 글리프 공급원. Manrope·Inter 에 없는 글자가 여기로 폴백된다 (PRD R5.10).
  // @fontsource 배포판은 latin 서브셋만 담고 있어 한글이 깨지므로, 원저작자
  // (orioncactus) 공식 패키지의 한글 서브셋(2,350자)판을 쓴다. font-display: swap 포함.
  import "pretendard/dist/web/static/pretendard-subset.css";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
