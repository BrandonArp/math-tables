import MD5 from 'crypto-js/md5';
import { jsPDF } from "jspdf";
const seedrandom = require('seedrandom');

function loaded() {
  let form = document.getElementById("form");
  form.addEventListener("submit", submitForm)
}

function submitForm(e) {
  e.preventDefault();
  const seed = document.getElementById("seed").value;
  let rng;
  if (seed != "") {
    const md5 = MD5(seed)
    rng = seedrandom(md5);
  } else {
    rng = seedrandom();
  }

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
  const num_min = document.getElementById("num_min").value;
  const num_max = document.getElementById("num_max").value;
  const denom_min = document.getElementById("den_min").value;
  const denom_max = document.getElementById("den_max").value;
  const sheets = document.getElementById("sheets").value;

  doc.setFontSize(24);

  function encode(num, den) {
    return [num, den];
  }

  function decode(val) {
    return [val[0], val[1]];
  }

  // Generate possibles field
  let numbers = [];
  for (let i = num_min; i <= num_max; i++) {
    for (let j = denom_min; j <=  denom_max; j++) {
      numbers.push(encode(i, j));
    }
  }

  function shuffle(numbers) {
    // Shuffle the field
    for (let i = 0; i < numbers.length; i++) {
      let swap = Math.floor(rng() * (numbers.length - i) + i);
      let tmp = numbers[swap];
      numbers[swap] = numbers[i];
      numbers[i] = tmp;
    }
  }
  shuffle(numbers);
  let index = 0;

  for (let sheet = 0; sheet < sheets; sheet++) {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        if (index >= numbers.length) {
          shuffle(numbers);
          index = 0;
        }

        let num = numbers[index];
        index++;

        let decoded = decode(num);
        let numerator = decoded[0];
        let denominator = decoded[1];

        let num_text = numerator.toString();
        let den_text = "x " + denominator.toString();
        let num_size = doc.getTextDimensions(num_text);
        let den_size = doc.getTextDimensions(den_text);

        let text_width = Math.max(num_size.w, den_size.w);
        let text_height = num_size.h + den_size.h;


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
    if (sheet < sheets - 1) {
      doc.addPage();
    }
  }

  doc.output("pdfobjectnewwindow", {filename: "multi.pdf"});
}

window.addEventListener('load', loaded);
