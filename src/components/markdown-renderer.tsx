import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_img]:rounded-md [&_blockquote]:border-l-muted-foreground/30 [&_blockquote]:text-muted-foreground [&_hr]:border-border [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_th]:text-left [&_th]:font-medium [&_td]:text-muted-foreground [&_table]:w-full [&_table]:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        urlTransform={(url) => {
          if (url.startsWith("javascript:") || url.startsWith("data:")) return ""
          return url
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
