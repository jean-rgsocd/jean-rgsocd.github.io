function generateVideoPrompt() {
  const type = document.getElementById('vid-type').value;
  const tone = document.getElementById('vid-tone').value;
  const prompt = `VEO 3 MASTER PROMPT v4.0\nCreate a ${type.toLowerCase()} video with a ${tone.toLowerCase()} tone. Include dynamic transitions, cinematic visuals, engaging narrative and professional pacing.`;
  document.getElementById('vid-result').innerText = prompt;
}