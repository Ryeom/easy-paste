import { App, PluginManifest } from "obsidian";
import MyPlugin from "./my-plugin";

export default function main(app: App, manifest: PluginManifest) {
	console.log("이거돌았나껄껄진짜죽여버린다")
	const plugin = new MyPlugin(app, manifest);


	return plugin;
}
