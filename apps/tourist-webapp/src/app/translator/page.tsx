import { ContextualTranslator } from "../../components/ContextualTranslator";

export default function TranslatorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-sand-50 pt-24 pb-20">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-display font-semibold text-primary mb-6 text-center">Contextual Translator</h1>
        <ContextualTranslator />
      </div>
    </main>
  );
}
