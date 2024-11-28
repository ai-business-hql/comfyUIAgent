import { MemoizedReactMarkdown } from "../../markdown";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import { BaseMessage } from './BaseMessage';

interface AIMessageProps {
    content: string;
    name?: string;
    avatar: string;
    format?: string;
}

export function AIMessage({ content, name = 'Assistant', avatar, format }: AIMessageProps) {
    const renderContent = () => {
        try {
            const parsedContent = JSON.parse(content);
            return (
                <div className="space-y-3">
                    {parsedContent.ai_message && (
                        <p className="whitespace-pre-wrap">
                            {parsedContent.ai_message}
                        </p>
                    )}
                </div>
            );
        } catch {
            if (format === 'markdown') {
                const formattedContent = String.raw`${content}`;
                return (
                    <MemoizedReactMarkdown
                        rehypePlugins={[
                            [rehypeExternalLinks, { target: '_blank' }],
                            rehypeKatex
                        ]}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        className="prose prose-sm max-w-none break-words"
                        components={{
                            table: ({ children }) => (
                                <table className="border-solid border border-[#979797] w-[100%]">{children}</table>
                            ),
                            th: ({ children }) => (
                                <th className="border-solid bg-[#E5E7ED] dark:bg-[#FFFFFF] dark:text-[#000000] border border-[#979797] text-center pt-2">{children}</th>
                            ),
                            td: ({ children }) => (
                                <td className="border-solid border border-[#979797] text-center">{children}</td>
                            ),
                        }}
                    >
                        {formattedContent}
                    </MemoizedReactMarkdown>
                );
            }
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