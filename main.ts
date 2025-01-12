// main.ts
import MyPlugin from "./my-plugin";

export default function main(app: App, manifest: PluginManifest) {
	return new MyPlugin(app, manifest);
}
