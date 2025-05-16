import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import {
  getUserSettings,
  updateUserSettings,
  getSettingDescriptions,
} from "@/api/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTitle } from '@/components/PageTitle';
import { PageSubtitle } from '@/components/PageSubtitle';

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
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch settings",
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
        title: "Success",
        description: response.message || "Settings saved successfully",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save settings",
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
    <div className="space-y-6">
      <div>
        <PageTitle>Settings</PageTitle>
        <PageSubtitle>Customize your account preferences</PageSubtitle>
      </div>

      <div className="bg-transparent divide-y divide-border rounded-2xl overflow-hidden">
        {Object.keys(settings).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between py-6 px-0"
          >
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={key}
                className="text-[14px] font-medium leading-normal tracking-[-0.28px] text-[#F7F8F8] cursor-pointer"
              >
                {descriptions[key]?.title}
              </Label>
              <p className="text-[14px] font-normal leading-[130%] tracking-[-0.28px] text-[#F7F8F8] opacity-60">
                {descriptions[key]?.description}
              </p>
            </div>
            <Checkbox
              id={key}
              checked={settings[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={handleResetSettings}
          disabled={!hasChanges || saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSaveSettings} disabled={!hasChanges || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
