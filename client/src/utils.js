import gradients from "./gradients.json";

export function getGradient(backgroundName) {
    const background = gradients.find(gradient => gradient.name === backgroundName);
    const colors = background.colors.map(color => { 
        if (color[0] !==  "#") {
            return `#${color}`;
        }
        return color;
    });
    
    return [
        `${colors[0]}`,
        `-webkit-linear-gradient(to top right, ${colors.join(", ")})`,
        `linear-gradient(to top right, ${colors.join(", ")})`
    ];
}