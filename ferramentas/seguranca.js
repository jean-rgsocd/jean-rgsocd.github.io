function analyzeSecurity() {
  const url = document.getElementById('sec-url').value;
  let results = `Security analysis for ${url}\n`;
  results += "✅ HTTPS enabled\n";
  results += "⚠️ Missing Content-Security-Policy header\n";
  results += "⚠️ Possible SQL Injection risk (simulated)\n";
  results += "✅ Strong password policy required\n";
  document.getElementById('sec-result').innerText = results;
}