// main.ts
import MyPlugin from "./my-plugin";
import { App, PluginManifest } from "obsidian";

export default function main(app: App, manifest: PluginManifest) {
	return new MyPlugin(app, manifest);
}
