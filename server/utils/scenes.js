const { Color } = require("./color");
const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;

class Scenes {
    constructor () {
        this.scenes = new JsonDB(new Config("scenes", true, true, '/'))
    }

    getCollection() {
        const sceneCollection = [];
        for (const [name, scene] of Object.entries(this.scenes.getData("/"))) {
            sceneCollection.push({
                name,
                background: scene.background,
                textColor: scene.textColor
            });
        }

        return sceneCollection;
    }

    getNode(sceneName) {
        const scene = this.scenes.getData(`/${sceneName}`);
        const sceneNode = { ...scene }
        sceneNode.colors = sceneNode.colors.map(color => new Color(color));

        return sceneNode;
    }

    createScene(_scene) {
        const newScene = {
            background: _scene.background,
            brightness: _scene.brightness,
            textColor: _scene.textColor,
            mode: _scene.mode,
            isKelvin: _scene.isKelvin,
            kelvinIndex: _scene.kelvinIndex,
            colors: _scene.colors.map(color => new Color(color["$"]).hexString),
            duration: _scene.duration,
            clockwiseRotation: _scene.clockwiseRotation
        };
        this.scenes.push(`/${_scene.name}`, newScene);
    }

    editScene(sceneName, scene) {
        this.scenes.push(`/${sceneName}`, scene, false);
    }

    removeScene(sceneName) {
        this.scenes.delete(`/${sceneName}`);
    }
}

module.exports = Scenes;