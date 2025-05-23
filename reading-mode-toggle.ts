import { Plugin, WorkspaceLeaf, setIcon, MarkdownView } from "obsidian";
import type MyPlugin from "./my-plugin";

export enum ReadingModeState {
    DEFAULT = "default",
    FORCE_READ = "read",
    FORCE_EDIT = "edit",
}

export default class ReadingModeController {
    plugin: Plugin;
    state: ReadingModeState = ReadingModeState.DEFAULT;
    iconEl: HTMLElement | null = null;

    constructor(public p: MyPlugin) {
        this.plugin = p;
        // 전역 이벤트 핸들러 등록
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("file-open", () => {
                this.applyModeToAllLeaves();
            })
        );
    }

    init() {
        if (!(this.plugin as MyPlugin).settings.showReadingModeIcon) {
            this.removeReadingModeIcon();
            return;
        }
        // 아이콘이 이미 없다면 새로 생성
        if (!this.iconEl) {
            this.iconEl = this.plugin.addRibbonIcon("eye", "Reading Mode Toggle", () => {
                this.cycleMode();
            });
        }
        this.updateIcon();
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("file-open", () => {
                this.applyModeToAllLeaves();
            })
        );

        // 수동 모드 변경 감지
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("active-leaf-change", () => {
                const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
                if (!view) return;
                const currentMode = view.getMode(); // "source" | "preview"
                if (this.state !== ReadingModeState.DEFAULT) {
                    const expected = this.state === ReadingModeState.FORCE_EDIT ? "source" : "preview";
                    if (currentMode !== expected) {
                        console.log("업뎃햊지롱 현재모드", currentMode, "익트펙트", expected)
                        this.state = ReadingModeState.DEFAULT;
                        this.updateIcon();
                    }
                }
            })
        );
    }

    removeReadingModeIcon() {
        this.iconEl?.remove();
        this.iconEl = null;
    }

    /** 모드 변경 순환: default -> read -> edit -> default */
    cycleMode() {
        const order = [
            ReadingModeState.DEFAULT,
            ReadingModeState.FORCE_READ,
            ReadingModeState.FORCE_EDIT,
        ];
        const currentIndex = order.indexOf(this.state);
        const nextIndex = (currentIndex + 1) % order.length;
        this.state = order[nextIndex];

        this.updateIcon();
        this.applyModeToAllLeaves();
    }

    /** 현재 열린 모든 파일에 대해 모드 적용 */
    applyModeToAllLeaves() {
        const leaves = this.plugin.app.workspace.getLeavesOfType("markdown");
        for (const leaf of leaves) {
            this.applyModeToLeaf(leaf);
        }
    }

    /** 개별 leaf에 대해 모드 적용 */
    applyModeToLeaf(leaf: WorkspaceLeaf) {
        const view = leaf.view;
        if (view.getViewType() !== "markdown") return;
        if (this.state === ReadingModeState.FORCE_EDIT) {
            leaf.setViewState({
                ...leaf.getViewState(),
                state: { ...leaf.getViewState().state, mode: "source" },
            });
        } else if (this.state === ReadingModeState.FORCE_READ) {
            leaf.setViewState({
                ...leaf.getViewState(),
                state: { ...leaf.getViewState().state, mode: "preview" },
            });
        }
        // DEFAULT 모드는 아무것도 안함
    }

    /** 상태에 따라 아이콘 변경 */
    updateIcon() {
        if (!this.iconEl) return;
        const iconMap: Record<ReadingModeState, string> = {
            [ReadingModeState.DEFAULT]: "eye",
            [ReadingModeState.FORCE_READ]: "book-open",
            [ReadingModeState.FORCE_EDIT]: "pencil",
        };

        const iconName = iconMap[this.state];
        setIcon(this.iconEl, iconName);
    }

    destroy() {
        this.iconEl?.remove();
    }
}