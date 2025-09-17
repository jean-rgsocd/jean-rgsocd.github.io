function generateImagePrompt() {
  const style = document.getElementById('img-style').value;
  const subject = document.getElementById('img-subject').value;
  const prompt = `A ${style.toLowerCase()} ${subject.toLowerCase()}, cinematic lighting, ultra realistic, 8k`;
  document.getElementById('img-result').innerText = prompt;
}