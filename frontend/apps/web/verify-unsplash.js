const https = require("https");
const url = "https://unsplash.com/photos/9Q7-dIbQ-p8";
https.get(url, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    const matches = [...body.matchAll(/https:\/\/images\.unsplash\.com\/[^"'> ]+/g)].map(m => m[0]);
    const unique = [];
    for (const v of matches) {
      if (!unique.includes(v)) unique.push(v);
    }
    console.log(unique.slice(0,20).join("\n"));
  });
});
