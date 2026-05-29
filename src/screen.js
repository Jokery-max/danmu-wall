import { onMessage } from "./bridge";
import { createDanmu } from "./danmu";

// Check for overlay mode: ?overlay=1
const params = new URLSearchParams(window.location.search);
if (params.get("overlay") === "1") {
  document.documentElement.style.background = "transparent";
  document.body.classList.add("overlay");
}

// Only show messages from this moment onward, ignore history
const pageOpenTime = Date.now();

onMessage((msg) => {
  createDanmu(msg.text, { type: msg.type, nickname: msg.nickname });
}, pageOpenTime);
