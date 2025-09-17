function runAITool() {
  const tool = document.getElementById('ai-tool').value;
  const text = document.getElementById('ai-input').value;
  let result = "";
  if (tool === "Summarizer") {
    result = text.split(" ").slice(0, 10).join(" ") + "...";
  } else if (tool === "Translator") {
    result = "[Translated to English] " + text;
  } else if (tool === "Creative Rewriter") {
    result = text.replace(/\bAI\b/gi, "Artificial Intelligence (AI)").replace("world","world in transformation");
  }
  document.getElementById('ai-result').innerText = result;
}