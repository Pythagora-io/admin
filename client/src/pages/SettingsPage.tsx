import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
        <h1 className="text-3xl font-bold">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Customize your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure your advanced preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(settings).map((key) => (
            <div
              key={key}
              className="flex items-start space-x-3 justify-between"
            >
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={key}
                  className="text-base font-medium cursor-pointer"
                >
                  {descriptions[key]?.title}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {descriptions[key]?.description}
                </p>
              </div>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </CardContent>
        <Separator />
        <CardFooter className="p-6 justify-between">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            disabled={!hasChanges || saving}
          >
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
