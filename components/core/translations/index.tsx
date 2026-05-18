"use client";

type TranslationsProps = {
  text?: string;
};

export default function Translations({ text }: TranslationsProps) {
  return <>{text ?? ""}</>;
}
