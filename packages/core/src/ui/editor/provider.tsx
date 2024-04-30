"use client";

import { createContext } from "react";
import { SlashCommandsConfig } from "./extensions/slash-command";
import { BubbleMenuConfig } from "./bubble-menu";
import { AICommandsConfig } from "./extensions/ai-command";

export const NovelContext = createContext<{
  completionApi: string;
  slashCommands?: SlashCommandsConfig;
  aiCommands?: AICommandsConfig;
  bubbleMenuItems?: BubbleMenuConfig;
}>({
  completionApi: "/api/generate",
  slashCommands: {},
  bubbleMenuItems: {},
  aiCommands: [],
});
