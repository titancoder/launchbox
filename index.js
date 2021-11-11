#!/usr/bin/env node

const fs = require("fs");
const ora = require("ora");
const figures = require("figures");
const chalk = require("chalk");
const { program } = require("commander");

const CFonts = require("cfonts");

program.version("0.0.1");
program.option("-i, --init").action(() => {
 const packages = ["express", "express-validator", "axios", "cors", "compression", "helmet"];

 const exec = require("child_process").exec;

 let count = 0;

 const initializeGit = () => {
  return new Promise((resolve, reject) => {
   const spinner = ora({
    text: `Initializing git repo`,
    spinner: "star",
   });
   spinner.start();
   setTimeout(() => {
    exec(`git init`, (err, stdout, stderr) => {
     if (err) {
      spinner.stop();
      console.error(err);
      console.log(chalk.yellowBright.bold(figures.main.tick), chalk.redBright(`Failed to initialize git repo`));

      reject(err);
     } else {
      spinner.stop();
      console.log(chalk.yellowBright.bold(figures.main.tick), chalk.yellowBright(`Initialized git repository`));
      resolve();
     }
    });
   }, 2000);
  });
 };

 const initializeNpm = () => {
  return new Promise((resolve, reject) => {
   const spinner = ora({
    text: `Initializing NPM project`,
    spinner: "star",
   });
   spinner.start();
   setTimeout(() => {
    exec(`npm init -y`, (err, stdout, stderr) => {
     if (err) {
      spinner.stop();
      console.error(err);
      console.log(chalk.yellowBright.bold(figures.main.tick), chalk.redBright(`Failed to initialize project`));

      reject(err);
     } else {
      spinner.stop();
      console.log(chalk.yellowBright.bold(figures.main.tick), chalk.yellowBright(`Initialized NPM project`));
      resolve();
     }
    });
   }, 2000);
  });
 };

 initializeGit()
  .then((result) => {
   initializeNpm()
    .then((result) => {
     const start = () => {
      if (count < packages.length) {
       let el = packages[count];
       const spinner = ora({
        text: `Installing ${el}`,
        spinner: "star",
       });
       spinner.start();
       exec(`npm i ${el}`, (err, stdout, stderr) => {
        if (err) {
         console.error(err);
         count += 1;
         return start();
        } else {
         spinner.stop();
         console.log(chalk.yellowBright.bold(figures.main.tick), chalk.yellowBright(`Installed ${el}`));
         count += 1;
         start();
        }
       });
      } else {
       console.log(
        chalk.greenBright.bold(figures.main.tick),
        chalk.greenBright(`Setup finished! You can start your server now :)`)
       );
       CFonts.say("TITANCODER", {
        font: "block", // define the font face
        align: "left", // define text alignment
        colors: ["system"], // define all colors
        background: "transparent", // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1, // define letter spacing
        lineHeight: 1, // define the line height
        space: true, // define if the output text should have empty lines on top and on the bottom
        maxLength: "0", // define how many character can be on one line
        gradient: false, // define your two gradient colors
        independentGradient: false, // define if you want to recalculate the gradient for each new line
        transitionGradient: false, // define if this is a transition between colors directly
        env: "node", // define the environment CFonts is being executed in
       });
      }
     };
     const folders = [
      "services",
      "controllers",
      "routes",
      "config",
      "utils",
      "models",
      "server",
      "middlewares",
      "helpers",
      "db",
     ];

     const dockerContent = `
FROM node:12-alpine
    
WORKDIR /usr/src/app
        
COPY package*.json ./
        
RUN npm install --only=production
        
COPY . ./
        
CMD [ "node", "index.js" ]      
`;

     const eslintContent = `
{
    "env": {
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
        "no-unused-vars":"off",
        "no-var":"error"
    }
}
        `;

     const serverContent = `
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
    
const app = express();
    
app.use(cors({ origin: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
    
module.exports = app;`;

     const indexContent = `
const app = require("./server/app.server");
                
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
console.log(\`Server: listening on port \${port}\`);
});
    
server.setTimeout(3600000);`;

     const files = ["Dockerfile", ".gitignore", ".dockerignore", ".eslintrc.json", "index.js"];

     folders.map((el, i) => {
      fs.mkdir(el, (err) => {
       if (err) {
        console.log(chalk.redBright.bold(figures.cross), chalk.redBright(`Failed to create ${el}`));
        console.log(err);
       } else {
        console.log(chalk.greenBright.bold(figures.main.tick), chalk.greenBright(`Created ${el}`));
        if (i == folders.length - 1) {
         files.map((el, i) => {
          let content = "";
          if (el === "Dockerfile") {
           content = dockerContent;
          }

          if (el === ".eslintrc.json") {
           content = eslintContent;
          }
          if (el === ".gitignore") {
           content = `node_modules`;
          }

          if (el === "index.js") {
           content = indexContent;
          }

          if (el === ".dockerignore") {
           content = `node_modules`;
          }

          //   if (el === "index.js")
          fs.writeFile(el, content, (err) => {
           if (err) {
            console.log(chalk.redBright.bold(figures.cross), chalk.redBright(`Failed to create ${el}`));
            console.log(err);
           } else {
            console.log(chalk.cyanBright.bold(figures.main.tick), chalk.cyanBright(`Created ${el}`));
            if (i == files.length - 1) {
             content = serverContent;
             fs.writeFile("./server/app.server.js", content, (err) => {
              if (err) {
               console.log(chalk.redBright.bold(figures.cross), chalk.redBright(`Failed to create app.server.js`));
               console.log(err);
              }
             });
             setTimeout(() => {
              start();
             }, 2000);
            }
           }
          });
         });
        }
       }
      });
     });
    })
    .catch((err) => {});
  })
  .catch((err) => {});
});

program.parse(process.argv);

// const spinner = ora("Installing express...");

// start();
