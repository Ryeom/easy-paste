import MyPlugin from "my-plugin";
import { MarkdownView, ItemView, Notice, TFile } from "obsidian";

export default class MyCustomSidebarTab extends ItemView {
    private plugin: MyPlugin;
    private lastActiveFile: TFile | null = null;
    private lastActiveMarkdownView: MarkdownView | null = null;

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

        this.app.workspace.on("file-open", (file) => {
            if (file instanceof TFile) {
                console.log("File Opened:", file.path);
                this.lastActiveFile = file;
            }
        });
        this.updateLastActiveFile();
    }

    // 활성 Markdown 뷰를 추적하는 메서드
    updateLastActiveMarkdownView(): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            this.lastActiveMarkdownView = activeView;
            console.log("Last active MarkdownView updated:", activeView.file?.path);
        } else {
            console.log("No active MarkdownView found.");
        }
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
        const activeFile =
            this.app.workspace.activeLeaf?.view instanceof MarkdownView
                ? this.app.workspace.activeLeaf.view.file
                : null;
        if (activeFile) {
            console.log("Active file updated:", activeFile.path);
            this.lastActiveFile = activeFile;
        } else {
            console.log("No active file found.");
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
            this.createItem(container, `${item.title} ${value}`, value, tooltip);
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
        try {
            const container = this.containerEl.children[1] as HTMLElement;
            if (container) {
                this.renderItems(container);
            }
        } catch (error) {
            console.error("Error refreshing sidebar items:", error);
        }
    }
    createItem(container: HTMLElement, title: string, value: string, tooltip: string) {
        if (title === '' || value === '') {
            return;
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

        button.addEventListener("mousedown", async (event) => {
            event.preventDefault();

            // 1. Check last active Markdown view
            let markdownView = this.lastActiveMarkdownView;

            // 2. If no last active view, fallback to getActiveViewOfType
            if (!markdownView) {
                markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
            }

            // 3. If no valid Markdown view found, notify and return
            if (!markdownView || !markdownView.editor) {
                new Notice("No active Markdown editor found.");
                return;
            }

            // 4. Insert value at current cursor position
            const cmEditor = markdownView.editor;
            const cursor = cmEditor.getCursor();

            cmEditor.replaceSelection(value);

            const newCursor = {
                line: cursor.line,
                ch: cursor.ch + value.length,
            };
            cmEditor.setCursor(newCursor);

            // 5. Ensure focus remains on editor
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

            // 마지막 활성 파일 참조
            const activeLeaf = this.app.workspace.getMostRecentLeaf(); // getMostRecentLeaf()로 활성화된 탭 참조
            const markdownView = activeLeaf?.view instanceof MarkdownView ? activeLeaf.view : null;

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
