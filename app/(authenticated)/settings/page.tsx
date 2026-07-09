import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { requireUser } from "@/lib/auth";
import { getAiSetting, toSettingsView } from "@/lib/ai/settings";

export const metadata = {
  title: "Settings · Genshin Material Tracker",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const setting = await getAiSetting(user.id);
  const settings = toSettingsView(setting);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-on-surface text-2xl font-black sm:text-3xl">
          Settings
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Connect the farming assistant to any AI model. Choose a provider, add
          your API key, and control which tracker data and how many tokens each
          reply may use.
        </p>
      </header>

      <AiSettingsForm initialSettings={settings} />
    </div>
  );
}
