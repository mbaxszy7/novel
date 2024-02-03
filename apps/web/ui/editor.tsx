"use client";

import { useState } from "react";
import { Editor as NovelEditor } from "novel";
import { CodeIcon } from "lucide-react";

export default function Editor() {
  const [saveStatus, setSaveStatus] = useState("Saved");

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
        {saveStatus}
      </div>
      <NovelEditor
        onUpdate={() => {
          setSaveStatus("Unsaved");
        }}
        extraExtensions={{
          bubbleMenuItems: {
            exclude: ["link"],
            add: [
              {
                name: "custom",
                isActive: () => false,
                command: console.log,
                icon: CodeIcon,
              },
            ],
          },
          slashCommands: {
            exclude: ["To-do List"],
            add: [
              {
                title: "Custom To-do List",
                description: "Use AI to expand your thoughts.",
                searchTerms: ["gpt"],
                icon: <span>pty</span>,
                command: ({ editor, range }: any) => {
                  editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleTaskList()
                    .run();
                },
              },
            ],
          },
        }}
        onDebouncedUpdate={() => {
          setSaveStatus("Saving...");
          // Simulate a delay in saving.
          setTimeout(() => {
            setSaveStatus("Saved");
          }, 500);
        }}
      />
    </div>
  );
}
