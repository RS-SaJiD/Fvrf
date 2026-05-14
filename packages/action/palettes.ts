export const basePalettes = {
  "github-light": {
    colorBackground: "#ffffff",
    colorDotBorder: "#1b1f230a",
    colorDots: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    colorEmpty: "#ebedf0",
    colorSnake: "purple",
  },
  "github-dark": {
    colorBackground: "#0c1116",
    colorDotBorder: "#1b1f230a",
    colorEmpty: "#161b22",
    colorDots: ["#161b22", "#01311f", "#034525", "#0f6d31", "#00c647"],
    colorSnake: "purple",
  },
  "red-github-light": {
    colorBackground: "#ffffff",
    colorDotBorder: "#1b1f230a",
    colorDots: ["#ebedf0", "#e99b9b", "#c44040", "#a13030", "#6e2121"],
    colorEmpty: "#ebedf0",
    colorSnake: "#2f363d",
  },
  "red-github-dark": {
    colorBackground: "#0c1116",
    colorDotBorder: "#1b1f230a",
    colorEmpty: "#161b22",
    colorDots: ["#161b22", "#310101", "#450303", "#6d0f0f", "#c60000"],
    colorSnake: "#e6edf3",
  },
  "halloween-light": {
    colorBackground: "#ffffff",
    colorDotBorder: "#1b1f230a",
    colorDots: ["#ebedf0", "#ffee4a", "#ffc501", "#fe9600", "#03001c"],
    colorEmpty: "#ebedf0",
    colorSnake: "#03001c",
  },
  "halloween-dark": {
    colorBackground: "#0c1116",
    colorDotBorder: "#1b1f230a",
    colorEmpty: "#161b22",
    colorDots: ["#161b22", "#631c03", "#bd561d", "#fa7a18", "#fddf68"],
    colorSnake: "#bc8cff",
  },
  "winter-light": {
    colorBackground: "#ffffff",
    colorDotBorder: "#1b1f230a",
    colorDots: ["#ebedf0", "#b6e3ff", "#54aeff", "#0969da", "#0a3069"],
    colorEmpty: "#ebedf0",
    colorSnake: "#fd8c00",
  },
  "winter-dark": {
    colorBackground: "#0c1116",
    colorDotBorder: "#1b1f230a",
    colorEmpty: "#161b22",
    colorDots: ["#161b22", "#0a3069", "#0969da", "#54aeff", "#b6e3ff"],
    colorSnake: "#7ee787",
  },
};

// aliases
export const palettes = {
  ...basePalettes,

  // aliases
  github: basePalettes["github-light"],
  default: basePalettes["github-light"],
};
