
var linkedin = "";
var github = "";
var email = '';
const empty = "&nbsp";

about = [
  "<br>",
  "Hi there, 👋🏽",
  "<br>",
];

links = [
  // format as table to achieve responsive column layout
  `<table>
   </table>`,
];

projects = [
  "<br>",
  "Work in progress... most projects are still offline, on GitHub or confidential.",
  "Here is a list of some GitHub repositories that I worked on:",
  "<br>",
  `<div id="repo-box"></div>`,
  repos,
];

help = [
  "<br>",
  'Use these commands to navigate my web-terminal:',
  // format as table to achieve responsive column layout
  `<table>
  </table>`,
  "<br>",
  "<br>",
];

banner = [
  "<br><br><br><br>",

//"████████▄     ▄████████    ▄█    █▄    ███▄▄▄▄  ",
//"███   ▀███   ███    ███   ███    ███   ███▀▀▀██▄",
//"███    ███   ███    ███   ███    ███   ███   ███",
//"███    ███   ███    ███  ▄███▄▄▄▄███▄▄ ███   ███",
//"███    ███ ▀███████████ ▀▀███▀▀▀▀███▀  ███   ███",
//"███    ███   ███    ███   ███    ███   ███   ███",
//"███   ▄███   ███    ███   ███    ███   ███   ██",
//"████████▀    ███    █▀    ███    █▀     ▀█   █▀",


//  "<br>",




];

welcomeMsg = [
  '<span class="color2 terminal-welcome-msg">Last login: Fri March 11 14:17:21 on ttys000</span>',
  "<br>",
];

allCommands = [
  "help", "about", "links", "projects", "email", "linkedin", "github", "history", "clear", "banner", "theme",
  "echo", "ping", "ls", "cd", "vi", "vim", "emacs", "sudo", "gui",
];

themes = {
  "coral": "css/style_coral.css",
  "midnight": "css/style_midnight.css",
  "chocolate": "css/style_chocolate.css",
};

allArgs = [
  "ls", "set", "random",
];
