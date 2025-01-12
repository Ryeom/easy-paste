import { PluginSettingTab, Setting, Notice } from "obsidian";

interface DateSet {
    title: string;
    description: string;
    dateList: Array<{ format: string; prefix: string; suffix: string }>;
}

interface ListItem {
    title: string;
    description: string;
    value: string;
}

interface ColorItem {
    color: string;
    title: string;
    description: string;
}

export default class MyPluginSettingTab extends PluginSettingTab {
    plugin: { settings: { dateSets: DateSet[]; listItems: ListItem[]; colorItems: ColorItem[] }; saveSettings: () => Promise<void> };


    constructor(app: any, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        // Render Date Settings
        this.renderDateSettings(containerEl);
        this.renderDynamicSettings(containerEl);
        this.renderColorSettings(containerEl);

        this.addStyles(containerEl);
    }


    renderDateSettings(containerEl: HTMLElement): void {
        const headerContainer = containerEl.createDiv({ cls: "header-container" });

        headerContainer.createEl("h2", { text: "Date 📆" });
        // headerContainer.style.height = ''

        const addDateButton = headerContainer.createEl("button", { text: "+" });
        addDateButton.onclick = async () => {
            this.plugin.settings.dateSets.push({
                title: "",
                description: "",
                dateList: [],
            });
            await this.plugin.saveSettings();
            this.display();
        };

        this.plugin.settings.dateSets.forEach((set: any, setIndex: number) => {
            const setContainer = containerEl.createDiv({ cls: "date-set-container" });

            const mainKeyword = new Setting(setContainer)
                .setName(`Date Set ${setIndex + 1}`)
                .addText((text) =>
                    text
                        .setPlaceholder("Enter description")
                        .setValue(set.description)
                        .onChange(async (value) => {
                            this.plugin.settings.dateSets[setIndex].description = value;
                            await this.plugin.saveSettings();
                        })
                )
                .addText((text) =>
                    text
                        .setPlaceholder("Enter title")
                        .setValue(set.title)
                        .onChange(async (value) => {
                            set.title = value;
                            await this.plugin.saveSettings();
                        })
                )
                .addExtraButton((button) =>
                    button
                        .setIcon("trash")
                        .setTooltip("Delete Set")
                        .onClick(async () => {
                            this.plugin.settings.dateSets.splice(setIndex, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                );


            if (0 === set.dateList.length) {
                const addDateItemButton = mainKeyword.controlEl.createEl("button", { text: "+" });
                addDateItemButton.style.marginRight = "10px"; // 버튼 스타일 조정
                addDateItemButton.onclick = async () => {
                    set.dateList.push({ format: "", prefix: "", suffix: "" });
                    await this.plugin.saveSettings();
                    this.display();
                };
                mainKeyword.controlEl.prepend(addDateItemButton);
            }

            set.dateList.forEach((item: any, itemIndex: number) => {
                const dateItemSetting = new Setting(setContainer)
                    // .setName(`Date Item ${itemIndex + 1}`)
                    .addText((text) =>
                        text
                            .setPlaceholder("Format")
                            .setValue(item.format)
                            .onChange(async (value) => {
                                item.format = value;
                                await this.plugin.saveSettings();
                            })
                    )
                    .addText((text) =>
                        text
                            .setPlaceholder("Prefix")
                            .setValue(item.prefix)
                            .onChange(async (value) => {
                                item.prefix = value;
                                await this.plugin.saveSettings();
                            })
                    )
                    .addText((text) =>
                        text
                            .setPlaceholder("Suffix")
                            .setValue(item.suffix)
                            .onChange(async (value) => {
                                item.suffix = value;
                                await this.plugin.saveSettings();
                            })
                    );

                dateItemSetting.addExtraButton((button) =>
                    button
                        .setIcon("trash")
                        .setTooltip("Delete Item")
                        .onClick(async () => {
                            set.dateList.splice(itemIndex, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                );

                if (itemIndex === set.dateList.length - 1) {
                    const addDateItemButton = dateItemSetting.controlEl.createEl("button", { text: "+" });
                    addDateItemButton.style.marginRight = "10px"; // 버튼 스타일 조정
                    addDateItemButton.onclick = async () => {
                        set.dateList.push({ format: "", prefix: "", suffix: "" });
                        await this.plugin.saveSettings();
                        this.display();
                    };

                    // 버튼을 컨트롤 요소의 가장 앞에 삽입
                    dateItemSetting.controlEl.prepend(addDateItemButton);
                }
            });
        });
    }


    renderDynamicSettings(containerEl: HTMLElement) {
        const dynamicHeaderContainer = containerEl.createDiv({ cls: "header-container" });

        dynamicHeaderContainer.createEl("h2", { text: "List 🤔" });

        const addDynamicButton = dynamicHeaderContainer.createEl("button", { text: "+" });
        addDynamicButton.onclick = async () => {
            this.plugin.settings.listItems.push({ title: "", description: "", value: "" });
            await this.plugin.saveSettings();
            this.display();
        };

        this.plugin.settings.listItems.forEach((item: ListItem, index: number) => {
            this.renderListItem(containerEl, item, index);
        });
    }


    renderColorSettings(containerEl: HTMLElement) {
        const colorHeaderContainer = containerEl.createDiv({ cls: "header-container" });

        colorHeaderContainer.createEl("h2", { text: "Palette 🌈" });

        const addColorButton = colorHeaderContainer.createEl("button", { text: "+" });
        addColorButton.onclick = async () => {
            this.plugin.settings.colorItems.push({
                color: "#fff",
                title: "",
                description: "",
            });
            await this.plugin.saveSettings();
            this.display();
        };

        this.plugin.settings.colorItems.forEach((colorItem: ColorItem, index: number) => {
            this.renderColorItem(containerEl, colorItem, index);
        });
    }


    renderDateItem(
        containerEl: HTMLElement,
        setIndex: number,
        item: { format: string; prefix: string; suffix: string },
        itemIndex: number,
        isFirstItem: boolean
    ) {
        const dateSetting = new Setting(containerEl).setName(`Date Item ${itemIndex + 1}`);

        dateSetting
            .addText((text) =>
                text
                    .setPlaceholder("format")
                    .setValue(item.format)
                    .setDisabled(isFirstItem)
            )
            .addText((text) =>
                text
                    .setPlaceholder("prefix")
                    .setValue(item.prefix)
                    .setDisabled(isFirstItem)
            )
            .addText((text) =>
                text
                    .setPlaceholder("suffix")
                    .setValue(item.suffix)
                    .setDisabled(isFirstItem)
            );

        if (isFirstItem) {
            dateSetting.addExtraButton((button) =>
                button
                    .setIcon("trash")
                    .setTooltip("Cannot Delete")
                    .onClick(() => {
                        new Notice("You cannot delete the first Date Item in 'Today'.");
                    })
                    .setDisabled(true)
            );
        } else {
            dateSetting.addExtraButton((button) =>
                button
                    .setIcon("trash")
                    .setTooltip("Delete Date")
                    .onClick(async () => {
                        this.plugin.settings.dateSets[setIndex].dateList.splice(itemIndex, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );
        }
    }

    renderListItem(containerEl: HTMLElement, item: ListItem, index: number) {
        const setting = new Setting(containerEl)
            .setName(`Item ${index + 1}`)
            .addText((text) =>
                text
                    .setPlaceholder("Enter title")
                    .setValue(item.title || "")
                    .onChange(async (value) => {
                        this.plugin.settings.listItems[index].title = value;
                        await this.plugin.saveSettings();
                    })
            )
            .addText((text) =>
                text
                    .setPlaceholder("Enter description")
                    .setValue(item.description)
                    .onChange(async (value) => {
                        this.plugin.settings.listItems[index].description = value;
                        await this.plugin.saveSettings();
                    })
            )
            .addText((text) =>
                text
                    .setPlaceholder("Enter value")
                    .setValue(item.value)
                    .onChange(async (value) => {
                        this.plugin.settings.listItems[index].value = value;
                        await this.plugin.saveSettings();
                    })
            )
            .addExtraButton((button) =>
                button
                    .setIcon("trash")
                    .setTooltip("Delete Item")
                    .onClick(async () => {
                        this.plugin.settings.listItems.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );
    }
    renderColorItem(containerEl: HTMLElement, colorItem: ColorItem, index: number) {
        const setting = new Setting(containerEl)
            .setName(`Color Item ${index + 1}`);

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = colorItem.color;
        colorInput.style.marginRight = "10px";
        colorInput.oninput = async (event) => {
            const target = event.target as HTMLInputElement;
            this.plugin.settings.colorItems[index].color = target.value;
            hexDisplay.textContent = target.value;
            await this.plugin.saveSettings();
        };

        const hexDisplay = document.createElement("span");
        hexDisplay.textContent = colorItem.color;
        hexDisplay.className = "hex-value";

        setting.controlEl.appendChild(colorInput);
        setting.controlEl.appendChild(hexDisplay);

        setting.addText((text) =>
            text
                .setPlaceholder("Enter title")
                .setValue(colorItem.title)
                .onChange(async (value) => {
                    this.plugin.settings.colorItems[index].title = value;
                    await this.plugin.saveSettings();
                })
        );

        setting.addText((text) =>
            text
                .setPlaceholder("Enter description")
                .setValue(colorItem.description)
                .onChange(async (value) => {
                    this.plugin.settings.colorItems[index].description = value;
                    await this.plugin.saveSettings();
                })
        );

        setting.addExtraButton((button) =>
            button
                .setIcon("trash")
                .setTooltip("Delete Color Item")
                .onClick(async () => {
                    this.plugin.settings.colorItems.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.display();
                })
        );
    }

    addStyles(containerEl: HTMLElement) {
        const style = document.createElement("style");
        style.textContent = `
            .header-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .header-container h2 {
                margin: 0;
            }

            .header-container button {
                padding: 5px 10px;
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .header-container button:hover {
                background: var(--interactive-accent-hover);
            }

            .date-set-container {
                border: 1px solid var(--background-modifier-border);
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 5px;
                background: var(--background-secondary);
            }

            .color-item-container input[type="color"] {
                margin-right: 10px;
            }

            .color-item-container .hex-value {
                font-family: monospace;
                margin-right: 10px;
                color: var(--text-accent);
            }
        `;
        containerEl.appendChild(style);
    }
}
