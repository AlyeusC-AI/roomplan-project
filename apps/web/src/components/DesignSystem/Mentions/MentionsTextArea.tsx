import { Mention, MentionsInput } from "react-mentions";

// TODO: move to tailwind styles
const mentionStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  color: "blue",
  textDecoration: "underline",
  pointerEvents: "none",
};

const mentionsInputStyle = {
  control: {
    backgroundColor: "#fff",
    fontSize: 16,
  },
  "&multiLine": {
    control: {
      fontFamily: "monospace",
      minHeight: 93,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid silver",
      borderRadius: "0.375rem",
    },
  },
  "&singleLine": {
    display: "inline-block",
    width: 180,
    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
      borderRadius: "0.375rem",
    },
  },
  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 16,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5",
      },
    },
  },
};

export default function MentionsTextArea({
  mentions,
  setMentions,
  value,
  setValue,
}: {
  mentions: {
    id: string;
    display: string;
  }[];
  setMentions: (id: string) => void;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <MentionsInput
      style={mentionsInputStyle}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      <Mention
        style={mentionStyle}
        data={mentions}
        onAdd={(id) => {
          setMentions(id as string);
        }}
        trigger={"@"}
      />
    </MentionsInput>
  );
}
