import MyPlugin from "my-plugin";
import { ItemView, Notice, MarkdownView, TFile } from "obsidian";

export default class MyCustomSidebarTab extends ItemView {
    private plugin: MyPlugin;
    private lastActiveFile: TFile | null = null;

    constructor(leaf: any, plugin: MyPlugin) {
        super(leaf);
        this.plugin = plugin;

        const eventTarget = this.plugin.getEventTarget();
        eventTarget.addEventListener("settings-updated", () => {
            this.refreshItems();
        });

        this.app.workspace.on("active-leaf-change", () => {
            this.updateLastActiveFile();
            this.refreshItems();
        });

        this.updateLastActiveFile();
    }

    getViewType(): string {
        return "my-custom-sidebar-tab";
    }

    getDisplayText(): string {
        return "My Easy Paste for Consistent Documentation"
    }

    getIcon(): string {
        return "star";
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        this.renderItems(container);
    }

    updateLastActiveFile(): void {
        const activeLeaf = this.app.workspace.activeLeaf;
        const activeFile = activeLeaf?.view instanceof MarkdownView ? activeLeaf.view.file : null;

        if (activeFile) {
            this.lastActiveFile = activeFile;
        }
    }

    renderItems(container: HTMLElement) {
        const { dateSets, listItems, colorItems } = this.plugin.settings;

        container.empty();

        dateSets.forEach((set) => {
            set.dateList.forEach((item: { format: string; prefix: string; suffix: string }) => {
                const { value, tooltip, title } = this.createDisplayTextForDate(
                    set.title,
                    set.description,
                    item,
                    this.lastActiveFile
                );
                this.createItem(container, title, value, tooltip);
            });
        });

        listItems.forEach((item: { title: string; description: string; value: string }) => {
            const value = item.value;
            const tooltip = item.description;
            this.createItem(container, `${item.title}: ${value}`, value, tooltip);
        });

        colorItems.forEach((colorItem: { color: string; title: string; description: string }) => {
            const value = colorItem.color;
            const tooltip = colorItem.description;
            this.createColorItem(container, colorItem.title, value, tooltip);
        });
    }

    createDisplayTextForDate(
        keyword: string,
        desc: string,
        options: { format: string; prefix: string; suffix: string },
        activeFile: TFile | null
    ): { value: string; tooltip: string; title: string } {
        const { format, prefix, suffix } = options;
        let value = "";
        let tooltip = "";
        let viewTitle = "";

        switch (keyword) {
            case "today":
                value = `${prefix}${this.formatDate(format)}${suffix}`;
                tooltip = `${prefix}${this.formatDate(format)}${suffix}`;
                viewTitle = `${desc} ${prefix}${this.formatDate(format)}${suffix}`;
                break;
            case "file_created_at":
                if (activeFile) {
                    const createdDate = new Date(activeFile.stat.ctime);
                    const formattedDate = this.formatDate(format, createdDate);

                    value = `${prefix}${formattedDate}${suffix}`;
                    tooltip = `${prefix}${formattedDate}${suffix}`;
                    viewTitle = `${desc} ${prefix}${formattedDate}${suffix}`;
                } else {
                    value = "";
                    tooltip = "";
                    viewTitle = ``;
                }
                break;
            default:
                break;
        }

        return {
            value,
            tooltip,
            title: viewTitle,
        };
    }

    refreshItems(): void {
        const container = this.containerEl.children[1] as HTMLElement;
        if (container) {
            this.renderItems(container);
        }
    }

    createItem(container: HTMLElement, title: string, value: string, tooltip: string) {
        if (title === '' || value === '') {  // createDisplayTextForDate에서 빈 string 전달
            return
        }
        const button = container.createEl("button", { text: title });
        button.className = "sidebar-item";
        button.title = tooltip;

        button.style.backgroundColor = "transparent";
        button.style.border = "1px solid var(--background-modifier-border)";
        button.style.margin = "0.1em";
        button.style.fontSize = "0.75em";
        button.style.borderRadius = "0.6em";
        button.style.height = "2.1em";

        // `mousedown` 이벤트 사용으로 버튼 클릭 시 즉시 반응
        button.addEventListener("mousedown", (event) => {
            event.preventDefault(); // 포커스 변경 방지
            const markdownLeaves = this.app.workspace.getLeavesOfType("markdown");
            const activeFile = this.lastActiveFile; // 마지막 활성 파일 참조

            if (!activeFile || markdownLeaves.length === 0) {
                new Notice("No active Markdown editor found to insert value.");
                return;
            }

            const markdownView = markdownLeaves[0].view as MarkdownView;

            if (!markdownView || !markdownView.editor) {
                new Notice("No active Markdown editor found to insert value.");
                return;
            }

            const cmEditor = markdownView.editor;
            const cursor = cmEditor.getCursor();

            cmEditor.replaceSelection(value);

            const newCursor = {
                line: cursor.line,
                ch: cursor.ch + value.length,
            };
            cmEditor.setCursor(newCursor);

            setTimeout(() => {
                cmEditor.focus();
            }, 0);
        });
    }

    createColorItem(container: HTMLElement, title: string, value: string, tooltip: string) {
        const button = container.createEl("button", { text: title });
        button.className = "sidebar-item";
        button.title = tooltip;
        button.style.backgroundColor = value;
        button.style.color = this.getTextColor(value);
        button.style.margin = "0.1em";
        button.style.fontSize = "0.75em";
        button.style.borderRadius = "0.6em";
        button.style.height = "2.1em";

        button.addEventListener("mousedown", (event) => {
            event.preventDefault();
            const activeFile = this.lastActiveFile;

            if (!activeFile) {
                return;
            }

            const markdownLeaves = this.app.workspace.getLeavesOfType("markdown");
            if (markdownLeaves.length === 0) {
                return;
            }

            const markdownView = markdownLeaves[0].view as MarkdownView;

            if (!markdownView || !markdownView.editor) {
                return;
            }

            const cmEditor = markdownView.editor;
            const cursor = cmEditor.getCursor();

            cmEditor.replaceSelection(value);

            const newCursor = {
                line: cursor.line,
                ch: cursor.ch + value.length,
            };
            cmEditor.setCursor(newCursor);

            setTimeout(() => {
                cmEditor.focus();
            }, 0);
        });
    }

    formatDate(format: string, date: Date = new Date()): string {
        return format
            .replace("YYYY", date.getFullYear().toString())
            .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
            .replace("DD", String(date.getDate()).padStart(2, "0"))
            .replace("hh", String(date.getHours()).padStart(2, "0"))
            .replace("mm", String(date.getMinutes()).padStart(2, "0"))
            .replace("ss", String(date.getSeconds()).padStart(2, "0"));
    }

    getTextColor(backgroundColor: string): string {
        const color = backgroundColor.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? "black" : "white";
    }
}
