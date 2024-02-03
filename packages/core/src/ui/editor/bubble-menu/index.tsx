import {
  BubbleMenu,
  BubbleMenuProps,
  Editor,
  isNodeSelection,
} from "@tiptap/react";
import { FC, useMemo, useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import { NodeSelector } from "./node-selector";
import { ColorSelector } from "./color-selector";
import { LinkSelector } from "./link-selector";
import { cn } from "@/lib/utils";
import useNovelContext from "@/lib/hooks/useNovelContext";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  // eslint-disable-next-line no-unused-vars
  command: (editor?: Editor) => void;
  icon: typeof BoldIcon;
}

type DefaultBubbleMenuItem =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "link";

export interface BubbleMenuConfig {
  /**
   * excludes default bubble menu item
   */
  exclude?: DefaultBubbleMenuItem[];
  /**
   * new bubble menu item to be added
   */
  add?: BubbleMenuItem[];
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children" | "editor"> & {
  editor: Editor;
};

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const { bubbleMenuItems } = useNovelContext();
  const defaultitems: BubbleMenuItem[] = useMemo(
    () => [
      {
        name: "bold",
        isActive: () => props.editor.isActive("bold"),
        command: () => props.editor.chain().focus().toggleBold().run(),
        icon: BoldIcon,
      },
      {
        name: "italic",
        isActive: () => props.editor.isActive("italic"),
        command: () => props.editor.chain().focus().toggleItalic().run(),
        icon: ItalicIcon,
      },
      {
        name: "underline",
        isActive: () => props.editor.isActive("underline"),
        command: () => props.editor.chain().focus().toggleUnderline().run(),
        icon: UnderlineIcon,
      },
      {
        name: "strike",
        isActive: () => props.editor.isActive("strike"),
        command: () => props.editor.chain().focus().toggleStrike().run(),
        icon: StrikethroughIcon,
      },
      {
        name: "code",
        isActive: () => props.editor.isActive("code"),
        command: () => props.editor.chain().focus().toggleCode().run(),
        icon: CodeIcon,
      },
    ],
    [props.editor]
  );
  const extendedItems = useMemo(() => {
    const _items = [
      ...defaultitems.filter(
        (item) => !bubbleMenuItems?.exclude?.includes(item.name as any)
      ),
      ...(bubbleMenuItems?.add?.map((item) => ({
        ...item,
        command: () => item.command(props.editor),
      })) ?? []),
    ];

    return _items;
  }, [
    defaultitems,
    bubbleMenuItems?.add,
    bubbleMenuItems?.exclude,
    props.editor,
  ]);

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ state, editor }) => {
      const { selection } = state;
      const { empty } = selection;

      // don't show bubble menu if:
      // - the selected node is an image
      // - the selection is empty
      // - the selection is a node selection (for drag handles)
      if (editor.isActive("image") || empty || isNodeSelection(selection)) {
        return false;
      }
      return true;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsColorSelectorOpen(false);
        setIsLinkSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="novel-flex novel-w-fit novel-divide-x novel-divide-stone-200 novel-rounded novel-border novel-border-stone-200 novel-bg-white novel-shadow-xl"
    >
      <NodeSelector
        editor={props.editor!}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
          setIsColorSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
      {!bubbleMenuItems?.exclude?.includes("link") && (
        <LinkSelector
          editor={props.editor!}
          isOpen={isLinkSelectorOpen}
          setIsOpen={() => {
            setIsLinkSelectorOpen(!isLinkSelectorOpen);
            setIsColorSelectorOpen(false);
            setIsNodeSelectorOpen(false);
          }}
        />
      )}
      <div className="novel-flex">
        {extendedItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.command()}
            className="novel-p-2 novel-text-stone-600 hover:novel-bg-stone-100 active:novel-bg-stone-200"
            type="button"
          >
            <item.icon
              className={cn("novel-h-4 novel-w-4", {
                "novel-text-blue-500": item.isActive(),
              })}
            />
          </button>
        ))}
      </div>
      <ColorSelector
        editor={props.editor!}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
    </BubbleMenu>
  );
};
