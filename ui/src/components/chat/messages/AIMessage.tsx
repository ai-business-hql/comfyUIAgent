import { MemoizedReactMarkdown } from "../../markdown";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import { BaseMessage } from './BaseMessage';
import { ChatResponse } from "../../../types/types";
import { useRef } from "react";
interface AIMessageProps {
  content: string;
  name?: string;
  avatar: string;
  format?: string;
  onOptionClick?: (option: string) => void;
}

export function AIMessage({ content, name = 'Assistant', avatar, format, onOptionClick }: AIMessageProps) {
  const markdownWrapper = useRef<HTMLDivElement | null>()
  const renderContent = () => {
    try {
      const response = JSON.parse(content) as ChatResponse;
      const guides = response.ext?.find(item => item.type === 'guides')?.data || [];

      if (format === 'markdown' && response.text) {
        return (
          <div ref={markdownWrapper as React.RefObject<HTMLDivElement>}>

            <MemoizedReactMarkdown
              rehypePlugins={[
                [rehypeExternalLinks, { target: '_blank' }],
                rehypeKatex
              ]}
              remarkPlugins={[remarkGfm, remarkMath]}
              className="prose prose-sm prose-neutral prose-a:text-accent-foreground/50 break-words whitespace-pre-wrap"
              components={{
                table: ({ children }) => (
                  <table className="border-solid border border-[#979797] w-[100%]">{children}</table>
                ),
                th: ({ children }) => (
                  <th className="border-solid bg-[#E5E7ED] dark:bg-[#FFFFFF] dark:text-[#000000] border border-[#979797] text-center pt-2">{children}</th>
                ),
                td: ({ children }) => {
                  if (Array.isArray(children) && children?.length > 0) {
                    const list: any[] = [];
                    const length = children.length;
                    for (let i = 0; i < length; i++) {
                      if (children[i] === '<br>') {
                        list.push(<br />)
                      } else {
                        list.push(children[i])
                      }
                    }
                    children = list;
                  }
                  return (
                    <td className="border-solid border border-[#979797] text-center">{children}</td>
                  )
                },
              }}
            >
              {response.text}
            </MemoizedReactMarkdown>

          </div>

        );
      }

      return (
        <div className="space-y-3">
          {response.text && (
            <p className="whitespace-pre-wrap">
              {response.text}
            </p>
          )}
          {guides.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {guides.map((guide: string, index: number) => (
                <button
                  key={index}
                  className="px-3 py-1.5 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs w-full"
                  onClick={() => onOptionClick?.(guide)}
                >
                  {guide}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    } catch {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <BaseMessage avatar={avatar} name={name}>
      <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-sm break-words overflow-hidden">
        {renderContent()}
      </div>
    </BaseMessage>
  );
} 