function runAITool() {
  const tool = document.getElementById('ai-tool').value;
  const text = document.getElementById('ai-input').value;
  let result = "";
  if (tool === "Summarizer") {
    result = "Summary: " + text.split(" ").slice(0, 20).join(" ") + "...";
  } else if (tool === "Translator") {
    result = "[Translated to English] " + text;
  } else if (tool === "Creative Rewriter") {
    result = "Creative rewrite: " + text.replace(/\bAI\b/gi, "Artificial Intelligence (AI)").replace("world","world in transformation");
  }
  document.getElementById('ai-result').innerText = result;
}