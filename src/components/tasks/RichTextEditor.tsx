"use client";

import { Editor } from "@tinymce/tinymce-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 160,
        menubar: false,
        plugins:
          "advlist autolink lists link image charmap preview anchor " +
          "searchreplace visualblocks code fullscreen " +
          "insertdatetime media table help wordcount",
        toolbar:
          "undo redo | blocks | bold italic underline | " +
          "alignleft aligncenter alignright | bullist numlist | " +
          "link image | removeformat",
      }}
    />
  );
}