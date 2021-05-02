import MD5 from 'crypto-js/md5';
import { jsPDF } from "jspdf";
const seedrandom = require('seedrandom');

function loaded() {
  console.log("Loaded");
  let form = document.getElementById("form");
  form.addEventListener("submit", submitForm)
}

function submitForm(e) {
  e.preventDefault();
  console.log("Submit");
  const seed = document.getElementById("seed").value;
  console.log("Seed: ", seed);
  const md5 = MD5(seed)
  console.log("MD5: ", md5.toString());

  let rng = seedrandom(md5);

  let width = 8.5;
  let height = 11;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [width, height]
  });

  let margin = 1.0;
  const columns = 5;
  const rows = 6;

  let xFactor = (width - (2 * margin)) / (columns - 1);
  let yFactor = (height - (2 * margin)) / (rows - 1);
  let max = 10;

  doc.setFontSize(24);

  // Generate possibles field
  let numbers = [];
  for (let i = 0; i < (max + 1) * (max); i++) {
    numbers.push(i);
  }

  // Shuffle the field
  for (let i = 0; i < numbers.length; i++) {
    let swap = Math.floor(rng() * (numbers.length - i) + i);
    let tmp = numbers[swap];
    numbers[swap] = numbers[i];
    numbers[i] = tmp;
  }
  console.log("Randomized:", numbers);
  let index = 0;

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      let num = numbers[index];
      index++;

      let numerator = Math.floor(num / max);
      let denominator = num % max;

      let num_text = numerator.toString();
      let den_text = "x " + denominator.toString();
      let num_size = doc.getTextDimensions(num_text);
      let den_size = doc.getTextDimensions(den_text);

      let text_width = Math.max(num_size.w, den_size.w);
      let text_height = num_size.h +  den_size.h;


      let xCenter = (i * xFactor) + margin;
      let yCenter = (j * yFactor) + margin;
      let xOffset = text_width / 2;
      let yOffset = text_height / 2;
      doc.text(num_text, xCenter + xOffset - num_size.w, yCenter - yOffset);
      doc.text(den_text, xCenter + xOffset - den_size.w, yCenter - yOffset + num_size.h);
      doc.setLineWidth(0.02);
      // doc.rect(xCenter - xOffset, yCenter - yOffset, text_width, text_height);
      doc.line(xCenter - (xOffset * 1.08), yCenter + yOffset - den_size.h + 0.05, xCenter + (xOffset * 1.08), yCenter + yOffset - den_size.h + 0.05);

    }
  }

  doc.output("pdfobjectnewwindow", {filename: "multi.pdf"});
}

window.addEventListener('load', loaded);
