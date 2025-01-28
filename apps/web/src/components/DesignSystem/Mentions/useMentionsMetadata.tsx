import { useMemo } from "react";

export interface MentionMetadata {
  text: string;
  url?: string;
}

const SPLIT_PATTERN = /(@\[[^\]]+\]\([^)]+\))/;
const MENTION_PATTERN = /(?:@\[([^\]]+)\]\(([^)]+)\))/;

export default function useMentionsMetadata(
  text: string,
  getUrl: (params: string, name?: string) => string | undefined
): MentionMetadata[] {
  const metadata = useMemo(() => {
    const parts = text.split(SPLIT_PATTERN);

    const convertPartToMetadata = (part: string): MentionMetadata => {
      if (!part.startsWith("@")) {
        return { text: part };
      }

      const match = part.match(MENTION_PATTERN);

      if (!match || match.length < 3) {
        return { text: part };
      }

      const [, name, params] = match;

      const url = getUrl(params, name);

      if (url) {
        return {
          text: name,
          url: url,
        };
      }

      return { text: name };
    };

    return parts.filter((part) => part !== "").map(convertPartToMetadata);
  }, [text, getUrl]);

  return metadata;
}
