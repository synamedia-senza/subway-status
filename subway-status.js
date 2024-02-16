const width = 1920;
const height = 1080;
const rotate = false;
const minProblems = 8;
const maxProblems = 10;

const main = document.getElementById("main");
let orientation = 270;
spin(rotate ? 270 : 0);

document.addEventListener("keydown", function(event) {
	switch (event.key) {
    case "ArrowUp": spin(-180); break;
    case "ArrowLeft": spin(-90); break;
    case "ArrowRight": spin(90); break;
    case "ArrowDown": spin(180); break;
    case "Enter": reload(); break;
		default: return;
	}
	event.preventDefault();
});

function spin(delta) {
  main.classList.remove(`orientation${orientation}`);
  orientation = (orientation + delta + 360) % 360;
  main.classList.add(`orientation${orientation}`);
}

let availableLineNames;
let availableCategories;
let availableProblems;
let availableExpansions;
let availableStations;

function reload() {
  main.innerHTML = "";
  cloneData();

  let messages = {};
  categories.forEach((category) => messages[category] = []);

  generate(messages, "Z", "No Scheduled Service"); // there is no Z
  for (let i = 0; i < randomBetween(minProblems, maxProblems) - 1; i++) {
    generate(messages);
  }

  categories.forEach((category) => {
    if (messages[category].length) {
      main.appendChild(paragraph("category", category.toUpperCase()));
      messages[category].forEach((problem) => main.appendChild(paragraph("problem", problem)));
    }
  });

  main.appendChild(paragraph("category", randomItem(ok).toUpperCase()));
  let dots = paragraph("problem", availableLineNames.map((line) => lineDot(line)).join(" "));
  dots.style.lineHeight = "1.5em";
  main.appendChild(dots);
}
reload();

function generate(messages, line = null, category = null) {
  let lines = line ? [line] : getLines();
  category = category ? category : randomItem(availableCategories);
  let problem = randomItem(availableProblems[category], true);
  let prev = problem;
  while (problem.includes("$")) {
    let lineDots = lineDot(lines[0]);
    if (lines.length == 2) lineDots += " and " + lineDot(lines[1]);
    problem = problem.replace("$DIRECTION", direction(lines[0]));
    problem = problem.replace("$LINE", lineDots);
    problem = problem.replace("$STATION", getStation(lines[0]));
    problem = problem.replace("$STATION", getStation(lines[0]));
    problem = problem.replace(/\$[A-Z_]*/, expand);
    if (prev == problem) break;
    prev = problem;
  }
  messages[category].push(problem);
}

function cloneData() {
  availableLineNames = clone(lineNames);
  availableProblems = clone(problems);
  availableExpansions = clone(expansions);
  availableStations = clone(stations);
  availableCategories = clone(categories);
  availableCategories.pop(); // remove no scheduled service
  
}

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

// returns an array with one or two lines (as long as they are the same color)
function getLines() {
  let line1 = randomItem(availableLineNames, true);
  let line2 = randomItem(availableLineNames, false); // don't remove it yet
  if (sameColor(line1, line2)) { // only remove it if we're going to use it
    availableLineNames.splice(availableLineNames.indexOf(line2), 1);
    return [line1, line2].sort();
  } else {
    return [line1];
  }
}

function randomItem(array, remove = false) {
  if (!array || array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  let value = array[randomIndex];
  if (remove && array.length > 1) array.splice(randomIndex, 1);
  return value;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function expand(token) {
  let list = availableExpansions[token];
  if (!list) return `X_${token.substring(1)}_X`;
  let remove = !["BECAUSE", "AMPM", "WHEN"].includes(token);
  let response = randomItem(list, remove);
  if (token == "$TRAIN") {
    response = lineDot(response);
  }
  return response;
}

function getStation(line) {
  return span(randomItem(availableStations[line], true), "station");
}

function lineDot(line) {
  return `<img class="bullet" src="lines/${line.toLowerCase()}train.png">`;
}

function direction(line) {
  return Math.random() > 0.5 ? randomItem(lineDirections[line]) : "";
}

function sameColor(a, b) {
  for (let group of lineGroups) {
    if (group.includes(a) && group.includes(b)) {
      return true;
    }
  }
  return false;
}

function span(text, span) {
  return `<span class="${span}">${text}</span>`
}

function paragraph(klass, text) {
  let p = document.createElement("p");
  p.classList.add(klass);
  p.innerHTML = text;
  return p;
}