import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { Separator } from "@/components/ui/separator";
import {
  getUserSettings,
  updateUserSettings,
  getSettingDescriptions,
} from "@/api/settings";

export function SettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: boolean }>({});
  const [descriptions, setDescriptions] = useState<{
    [key: string]: { title: string; description: string };
  }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<{
    [key: string]: boolean;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsData, descriptionsData] = await Promise.all([
          getUserSettings(),
          getSettingDescriptions(),
        ]);

        setSettings(settingsData.settings);
        setOriginalSettings(settingsData.settings);
        setDescriptions(descriptionsData.descriptions);
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  useEffect(() => {
    // Check if settings have changed from original
    const settingsChanged = Object.keys(settings).some(
      (key) => settings[key] !== originalSettings[key],
    );
    setHasChanges(settingsChanged);
  }, [settings, originalSettings]);

  const handleToggle = (key: string) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await updateUserSettings({ settings });
      setOriginalSettings(response.settings);
      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Settings saved successfully",
      });
      setHasChanges(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-3">Settings</h1>
        <p className="text-body-sm text-foreground/60">
          Customize your account preferences
        </p>
      </div>

      {/* Action Buttons - Moved to top */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleResetSettings}
          disabled={!hasChanges || saving}
          className="text-body-md px-4"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={!hasChanges || saving}
          className="text-body-md px-4"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings List */}
      <div className="flex flex-col">
        {Object.keys(settings).map((key, index) => (
          <div key={key}>
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <p
                  className={`text-body-md font-semibold  transition-all duration-300 ${settings[key] ? "text-foreground" : "text-foreground/60"}`}
                >
                  {descriptions[key]?.title}
                </p>
                <p className="text-body-sm text-foreground/60 mt-1">
                  {descriptions[key]?.description}
                </p>
              </div>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => handleToggle(key)}
                className="data-[state=checked]:bg-success ml-4"
              />
            </div>
            {index < Object.keys(settings).length - 1 && (
              <Separator className="bg-foreground/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
