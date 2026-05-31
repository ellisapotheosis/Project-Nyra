'use client';

import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from '@/components/ThemeProvider';

interface TinyMCEComponentProps {
  initialHtml?: string;
  onChange?: (html: string) => void;
  height?: string;
}

export interface TinyMCEComponentRef {
  getHtml: () => string;
  setHtml: (html: string) => void;
}

export const TinyMCEComponent = forwardRef<TinyMCEComponentRef, TinyMCEComponentProps>(({
  initialHtml = '',
  onChange,
  height = 'calc(100vh - 80px)',
}, ref) => {
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const initialHtmlRef = useRef(initialHtml);
  const { resolvedTheme } = useTheme();

  // Store initial HTML on first render only
  if (initialHtmlRef.current === '' && initialHtml !== '') {
    initialHtmlRef.current = initialHtml;
  }

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Hide tox-promotion banner
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .tox-promotion,
      .tox-statusbar__branding {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getHtml: () => {
      if (editorRef.current) {
        return editorRef.current.getContent();
      }
      return '';
    },
    setHtml: (html: string) => {
      if (editorRef.current) {
        editorRef.current.setContent(html);
      }
    },
  }));

  const handleEditorChange = (content: string) => {
    if (onChangeRef.current) {
      onChangeRef.current(content);
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="tinymce-wrapper" style={{ height }}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          // Set initial content after editor is ready
          if (initialHtmlRef.current) {
            editor.setContent(initialHtmlRef.current);
          }
        }}
        init={{
          height: height,
          promotion: false,
          skin: isDark ? 'oxide-dark' : 'oxide',
          content_css: isDark ? 'dark' : 'default',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image',
            'charmap', 'preview', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table'
          ],
          toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | fullscreen | subscript superscript',
          relative_urls: false,
          remove_script_host: false,
          convert_urls: false,
          automatic_uploads: true,
          images_upload_url: '/api/upload',
          images_upload_handler: async (blobInfo) => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('file', blobInfo.blob(), blobInfo.filename());

              fetch('/api/upload', {
                method: 'POST',
                body: formData,
              })
                .then((response) => response.json())
                .then((result) => {
                  if (result.url) {
                    resolve(result.url);
                  } else if (result.location) {
                    resolve(result.location);
                  } else {
                    reject('Upload failed: No URL returned');
                  }
                })
                .catch((error) => {
                  reject('Upload failed: ' + error.message);
                });
            });
          },
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview' },
            edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
            view: { title: 'View', items: 'code | visualaid visualchars visualblocks | preview fullscreen' },
            insert: { title: 'Insert', items: 'image link codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor | insertdatetime' },
            format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | blocks | fontfamily fontsize align lineheight | forecolor backcolor | removeformat' },
            tools: { title: 'Tools', items: 'code wordcount' },
            table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
          },
          // Email-friendly settings
          forced_root_block: 'p',
          valid_elements: '*[*]',
          extended_valid_elements: '*[*]',
          valid_children: '+body[style],+body[meta],+body[link]',
          // Content style for email
          content_style: `
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: ${isDark ? '#f3f4f6' : '#000000'};
              background: ${isDark ? '#1f2937' : '#ffffff'};
              padding: 20px;
            }
            table {
              max-width: 600px;
              margin: 0 auto;
              border-collapse: collapse;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          `,
        }}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
});

TinyMCEComponent.displayName = 'TinyMCEComponent';
