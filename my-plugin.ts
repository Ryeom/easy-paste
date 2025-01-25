import { App, Plugin, PluginManifest, EventRef } from "obsidian";
import MyPluginSettingTab from "./my-plugin-setting-tab";
import MyCustomSidebarTab from "./my-custom-sidebar-tab";

interface MyPluginSettings {
    dateSets: Array<{
        title: string;
        description: string;
        dateList: Array<{ format: string; prefix: string; suffix: string }>;
    }>;
    listItems: Array<{ title: string; description: string; value: string }>;
    colorItems: Array<{ color: string; title: string; description: string }>;
}
const DEFAULT_SETTINGS: MyPluginSettings = {
    dateSets: [],
    listItems: [],
    colorItems: []
};

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    private eventTarget: EventTarget;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.eventTarget = new EventTarget();
        this.settings = { dateSets: [], listItems: [], colorItems: [] };
    }

    async onload() {
        console.log("Loading My Plugin");
        // Initialize EventTarget for custom events
        this.eventTarget = new EventTarget();
        // 플러그인 설정 페이지 버튼 생성
        this.addSettingTab(new MyPluginSettingTab(this.app, this));
        // Load settings
        await this.loadSettings();

        // Register sidebar tab
        this.registerView("my-custom-sidebar-tab", (leaf) => new MyCustomSidebarTab(leaf, this));

        // Add ribbon icon to toggle sidebar tab
        this.addRibbonIcon("star", "Toggle Sidebar Tab", () => {
            // this.ensureSidebarTab();
            this.toggleSidebarTab();
        });

        // 활성 Markdown 뷰를 추적하는 이벤트 리스너 추가
        this.app.workspace.on("active-leaf-change", () => {
            const customSidebarTab = this.app.workspace
                .getLeavesOfType("my-custom-sidebar-tab")[0]?.view as MyCustomSidebarTab;

            if (customSidebarTab) {
                customSidebarTab.updateLastActiveMarkdownView();
                customSidebarTab.refreshItems(); // 사이드바 업데이트
            }
        });
        // Ensure the sidebar tab is available on load
        await this.ensureSidebarTab();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async onunload() {
        console.log("Unloading My Plugin");
    }
    async saveSettings() {
        await this.saveData(this.settings);

        // Dispatch custom "settings-updated" event
        this.eventTarget.dispatchEvent(new Event("settings-updated"));
    }

    getEventTarget(): EventTarget {
        return this.eventTarget;
    }


    async toggleSidebarTab() {
        const rightSidebar = this.app.workspace.rightSplit;
        if (rightSidebar) {
            if (rightSidebar.collapsed) {
                rightSidebar.expand();
            } else {
                rightSidebar.collapse();
            }
        }
    }
    async ensureSidebarTab(): Promise<void> {
        const leaves = this.app.workspace.getLeavesOfType("my-custom-sidebar-tab");

        if (leaves.length === 0) {
            let newLeaf = this.app.workspace.getRightLeaf(true);
            if (!newLeaf) {
                console.log("Right leaf not available, creating new right leaf.");
                newLeaf = this.app.workspace.getLeaf(true);
            }

            if (!newLeaf) {
                console.error("Failed to create a new leaf for the sidebar tab.");
                return;
            }

            await newLeaf.setViewState({ type: "my-custom-sidebar-tab", active: true });
        } else {
            const leaf = leaves[0];
            this.app.workspace.revealLeaf(leaf);
        }
    }


}
