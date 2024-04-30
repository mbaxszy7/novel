import { Editor, Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CommandItemProps,
  SlashCommandsConfig,
  updateScrollView,
} from "./slash-command";
import useNovelContext from "@/lib/hooks/useNovelContext";

const SuggestionPluginKey = new PluginKey("aicommand-suggestion");

export type AICommandsConfig = SlashCommandsConfig["add"];

const AICommandExt = Extension.create({
  name: "ai-command",
  addOptions() {
    return {
      suggestion: {
        char: "ai/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: any;
        }) => {
          props.command({ ...props, editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: SuggestionPluginKey,
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
const AICommandList = ({
  items,
  command,
  editor,
  range,
}: {
  items: CommandItemProps[];
  command: any;
  editor: any;
  range: any;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { aiCommands } = useNovelContext();
  const extendedItems = useMemo(
    () => [...items, ...(aiCommands ?? [])],
    [aiCommands, items]
  );
  const selectItem = useCallback(
    (index: number) => {
      const item = extendedItems[index];

      if (item) {
        command({ ...item, editor, range, selectedItem: item });
      }
    },
    [extendedItems, command, editor, range]
  );

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      console.log("onKeyDown", e.key);
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + extendedItems.length - 1) % extendedItems.length
          );
          return true;
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % extendedItems.length);
          return true;
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [extendedItems, selectedIndex, setSelectedIndex, selectItem]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [extendedItems]);

  const commandListContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = commandListContainer?.current;

    const item = container?.children[selectedIndex] as HTMLElement;

    if (item && container) updateScrollView(container, item);
  }, [selectedIndex]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      id="ai-command"
      ref={commandListContainer}
      className="novel-z-50 novel-h-auto novel-max-h-[330px] novel-w-72 sm:novel-w-96 novel-overflow-y-auto novel-rounded-md novel-border novel-border-stone-200 novel-bg-white novel-px-1 novel-py-2 novel-shadow-md novel-transition-all"
    >
      {extendedItems.map((item: CommandItemProps, index: number) => {
        if (item.renderItem) {
          return (
            <Fragment key={index}>
              {item.renderItem({
                editor,
                range,
              })}
            </Fragment>
          );
        }
        return (
          <button
            className={`novel-flex novel-w-full novel-items-center novel-space-x-2 novel-rounded-md novel-px-2 novel-py-1 novel-text-left novel-text-sm novel-text-stone-900 hover:novel-bg-stone-100 ${
              index === selectedIndex
                ? "novel-bg-stone-100 novel-text-stone-900"
                : ""
            }`}
            key={index}
            onClick={(e) => {
              selectItem(index);
              e.stopPropagation();
            }}
          >
            <div className="novel-flex novel-h-10 novel-w-10 novel-items-center novel-justify-center novel-rounded-md novel-border novel-border-stone-200 novel-bg-white">
              {item.icon}
            </div>
            <div>
              <p className="novel-font-medium">{item.title}</p>
              <p className="novel-text-xs novel-text-stone-500">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(AICommandList, {
        props,
        editor: props.editor,
      });

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();
        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

const AICommand = AICommandExt.configure({
  suggestion: {
    pluginKey: SuggestionPluginKey,
    items: () => [],
    render: renderItems,
  },
});

export default AICommand;
