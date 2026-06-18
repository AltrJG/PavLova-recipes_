import React, { useCallback, useEffect, useMemo, useState } from "react";
import isHotkey from "is-hotkey";
//import imageExtensions from 'image-extensions'
import { Editable, withReact, ReactEditor, useSelected, useSlate, useFocused, Slate, useSlateStatic } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import styles from './EnrichedTextRecipe.module.css';
//import isUrl from "is-url";
//import Swal from "sweetalert2";

import { Button, Icon, Toolbar } from "./LexicalHelpers";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const EnrichedTextRecipe = ({ recetaProceso, setRecetaProceso, isUpdateActive }) => {
  const [value, setValue] = useState(recetaProceso || [
    {
      type: "paragraph",
      children: [{ text: "" }]
    }
  ]);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    setRecetaProceso(value);
  }, [value]);

  useEffect(() => {
    if (isUpdateActive && recetaProceso && Array.isArray(recetaProceso)) {
      // Remove all existing nodes
      Transforms.removeNodes(editor, {
        at: [],
        match: n => Editor.isBlock(editor, n),
      });

      // Insert new content
      Transforms.insertNodes(editor, recetaProceso, { at: [0] });
    }
  }, [isUpdateActive]);

  if (!value || !Array.isArray(value)) {
    return <div>Cargando editor...</div>;
  }

  return (
    <div className={styles.mainEditor}>
        <Slate editor={editor} initialValue={value} onChange={value => setValue(value)}>
        <Toolbar>
            <MarkButton format="bold" icon="bold" />
            <MarkButton format="italic" icon="italic" />
            <MarkButton format="underline" icon="underline" />
            <MarkButton format="code" icon="code" />
            <BlockButton format="heading-one" icon="looks_one" />
            <BlockButton format="heading-two" icon="looks_two" />
            <BlockButton format="block-quote" icon="format_quote" />
            <BlockButton format="numbered-list" icon="format_list_numbered" />
            <BlockButton format="bulleted-list" icon="format_list_bulleted" />
            {/*<InsertImageButton />
            <InsertLink/>*/}
        </Toolbar>
        <Editable
            className={styles.editorContent}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            spellCheck
            autoFocus
            onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
                }
            }
            }}
            style={{
                fontSize: "4rem",
                lineHeight: '0rem',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                color: '#333',
                height: '100%',
              }}
        />
        </Slate>
    </div>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  const props = { attributes, children, element };
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    //case 'image':
      //return <Image {...props} />
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  const props = {attributes, children, leaf};
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if(leaf.link){
    children = <LinkSlate {...props}/>
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon icon={icon}></Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon icon={icon}></Icon>
    </Button>
  );
};

/*const InsertImageButton = () => {
  const editor = useSlateStatic();

  return (
    <Button
      onClick={event => {
        let url;
        event.preventDefault()
        Swal.fire({
          title: 'Add image',
          text: `Enter the Image URL`,
          icon: "info",
          input: "text",
          confirmButtonColor: '#ffcc00',
          showCancelButton: true,
          confirmButtonText: 'Done',
          cancelButtonText: "Cancel",
          cancelButtonColor: "#ff0000"
        }).then((result) => {
          if(result.isConfirmed){
              url = result.value;
          }
          if (url && !isImageUrl(url)) {
            return Swal.fire({
              title: "Error",
              icon: "error",
              text: "The specified url is not an image",
              confirmButtonColor: "#ffcc00"
          });
          }
          url && insertImage(editor, url)
        });
      }}
    >
      <Icon>image</Icon>
    </Button>
  )
}*/

/*const InsertLink = () => {
  const editor = useSlateStatic();

  return (
    <Button
      onClick={event => {
        let url, text;
        event.preventDefault()
        Swal.fire({
          title: 'Add link',
          text: `Enter the URL you want to use`,
          icon: "info",
          html:
          '<input id="text" class="swal2-input" placeholder="The text that will be displayed">' +
          '<input id="url" class="swal2-input" placeholder="The url of the text">',
          preConfirm: () => {
            return [
              document.getElementById('text').value,
              document.getElementById('url').value
            ]
          },
          confirmButtonColor: '#ffcc00',
          showCancelButton: true,
          confirmButtonText: 'Done',
          cancelButtonText: "Cancel",
          cancelButtonColor: "#ff0000"
        }).then((result) => {
          if(result.isConfirmed){
            text = document.getElementById("text").value;
            url = document.getElementById("url").value;
            if (!url || !isUrl(url) || !text) {
              return Swal.fire({
                title: "Error",
                icon: "error",
                text: "The specified url is not a link",
                confirmButtonColor: "#ffcc00"
              });
            }
            url && insertNewLink(editor, text, url)
          }
        });
      }}
    >
      <Icon>link</Icon>
    </Button>
  )
}
*/
/*const insertImage = (editor, url) => {
  const text = { text: '' }
  const image = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
}*/

/*const linkNode = (url, texto) => {
  const link = {
    children: [{text: texto, link: true, url}],
    type: "paragraph"
  }
  return link
}

const insertNewLink = (editor, text, url) => {
  if(!url || !text) return;

  const link = linkNode(url, text);

  ReactEditor.focus(editor);
  Transforms.insertNodes(editor, link, { select: true });
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}*/

/*const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <img
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: ${selected && focused ? 'inline' : 'none'};
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
        >
          <Icon>delete</Icon>
        </Button>
      </div>
    </div>
  )
}*/

const LinkSlate = ({ attributes, children, leaf }) => {
  return(
    <a
     {...attributes}
      href={leaf.url}>
      {children}
    </a>
  )
}

export default EnrichedTextRecipe;
