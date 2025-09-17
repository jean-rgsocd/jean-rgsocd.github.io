function generateImagePrompt() {
  const style = document.getElementById('img-style').value;
  const subject = document.getElementById('img-subject').value;
  const prompt = `IMAGES MASTER PROMPT v1.0\nA ${style.toLowerCase()} ${subject.toLowerCase()}, cinematic lighting, ultra realistic, 8k, trending on artstation, highly detailed.`;
  document.getElementById('img-result').innerText = prompt;
}