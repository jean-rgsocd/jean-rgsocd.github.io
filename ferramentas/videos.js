function generateVideoPrompt() {
  const type = document.getElementById('vid-type').value;
  const tone = document.getElementById('vid-tone').value;
  const prompt = `VEO 3 MASTER PROMPT v4.0\nCreate a ${type.toLowerCase()} video with a ${tone.toLowerCase()} tone.\nRequirements:\n- Cinematic transitions\n- Professional pacing\n- Engaging visuals\n- Narrative depth.`;
  document.getElementById('vid-result').innerText = prompt;
}