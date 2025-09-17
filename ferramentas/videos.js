function generateVideoPrompt() {
  const type = document.getElementById('vid-type').value;
  const tone = document.getElementById('vid-tone').value;
  const prompt = `Create a ${type.toLowerCase()} video with a ${tone.toLowerCase()} tone, engaging visuals and clear storytelling.`;
  document.getElementById('vid-result').innerText = prompt;
}