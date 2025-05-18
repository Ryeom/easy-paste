import { Plugin, WorkspaceLeaf, setIcon } from "obsidian";
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
        console.log("이닛이다 이것들아 11111")
        if (!(this.plugin as MyPlugin).settings.showReadingModeIcon) {
            this.removeReadingModeIcon();
            return;
        }
        console.log("이닛이다 이것들아 22222222")
        // 아이콘이 이미 없다면 새로 생성
        if (!this.iconEl) {
            this.iconEl = this.plugin.addRibbonIcon("eye", "Reading Mode Toggle", () => {
                this.cycleMode();
            });
        }

        console.log("이닛이다 이것들아 33333333333")
        this.updateIcon();
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("file-open", () => {
                this.applyModeToAllLeaves();
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
        console.log("아이콘 업데이트 해따이것들아 1")
        if (!this.iconEl) return;
        console.log("아이콘 업데이트 해따이것들아 2")
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
