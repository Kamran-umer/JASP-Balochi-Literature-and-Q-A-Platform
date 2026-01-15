'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Quote, Minus } from 'lucide-react'
import { useEffect } from 'react'

type EditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write something amazing...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        
        class: 'rich-text-content focus:outline-none min-h-[150px] max-w-none px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false, 
  })

  
  useEffect(() => {
    if (editor && content === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.setContent('')
    }
  }, [content, editor])

  if (!editor) return null

  const isActive = (type: string, opts?: any) => editor.isActive(type, opts) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100'

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
     
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${isActive('bold')}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${isActive('italic')}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${isActive('bulletList')}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${isActive('orderedList')}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${isActive('blockquote')}`}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </button>
      </div>

     
      <EditorContent editor={editor} className="cursor-text" />
    </div>
  )
}