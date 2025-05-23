import { App, PluginManifest } from "obsidian";
import MyPlugin from "./my-plugin";

export default function main(app: App, manifest: PluginManifest) {
	const plugin = new MyPlugin(app, manifest);
	return plugin;
}
