import React from "react";
import ReactDOM from "react-dom";
import { cx, css } from "@emotion/css";

// icons.js
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import TitleIcon from "@mui/icons-material/Title";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

const icons = {
    bold: FormatBoldIcon,
    italic: FormatItalicIcon,
    underline: FormatUnderlinedIcon,
    code: CodeIcon,
    title: TitleIcon,
    looks_one: LooksOneIcon,
    looks_two: LooksTwoIcon,
    format_quote: FormatQuoteIcon,
    format_list_numbered: FormatListNumberedIcon,
    format_list_bulleted: FormatListBulletedIcon,
};

export const Button = React.forwardRef(
    ({ className, active, reversed, ...props }, ref) => (
      <span
        {...props}
        ref={ref}
        className={cx(
          className,
          css`
            cursor: pointer;
            padding: 6px;
            border-radius: 4px;
            transition: .3s;
            box-shadow: ${active ? "0 4px 12px rgba(255, 165, 0, 0.4)" : ""};
            background: ${active ? "linear-gradient(315deg, rgba(241,180,52,1) 27%, rgba(252,115,2,1) 100%);" : "transparent"};
            color: ${reversed
              ? active
                ? "white"
                : "#aaa"
              : active
              ? "black"
              : "#666"};
            &:hover {
              background-color: ${active ? "#d5d5d5" : "#f0f0f0"};
            }
            & button{
              background-color: transparent;
              border: none;
              color: ${active ? "white" : "black"};
            }
            @media(max-width: 31.25em){
              padding: .3rem;
              margin-left: 10px;
            }
          `
        )}
      />
    )
  );

Button.displayName = "ButtonLexical";

export const EditorValue = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    const textLines = value.document.nodes
      .map(node => node.text)
      .toArray()
      .join("\n");
    return (
      <div
        ref={ref}
        {...props}
        className={cx(
          className,
          css`
            margin: 30px -20px 0;
          `
        )}
      >
        <div
          className={css`
            font-size: 14px;
            padding: 5px 20px;
            color: #404040;
            border-top: 2px solid #eeeeee;
            background: #f8f8f8;
          `}
        >
          Slate value as text
        </div>
        <div
          className={css`
            color: #404040;
            font: 12px monospace;
            white-space: pre-wrap;
            padding: 10px 20px;
            div {
              margin: 0 0 0.5em;
            }
          `}
        >
          {textLines}
        </div>
      </div>
    );
  }
);

EditorValue.displayName = "EditorLexical";

export function Icon({ icon, ...props }) {
    const IconComponent = icons[icon];
  
    if (!IconComponent) return null;
  
    return (
      <button {...props}>
        <IconComponent sx={{ fontSize: 20 }} />
      </button>
    );
  }

Icon.displayName = "IconLexical";

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        white-space: pre-wrap;
        margin: 0 -20px 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #f8f8e8;
      `
    )}
  />
));

Instruction.displayName = "InstructionLexical";

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));

Menu.displayName = "MenuLexical";

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        position: relative;
        padding: 1rem;
        background: linear-gradient(145deg, #ffffff, #e6e6e6);
        margin: 0;
        border-bottom: 2px solid #eee;
      `
    )}
  />
));


Toolbar.displayName = "Toolbar";