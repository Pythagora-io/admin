import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProjectDraft } from "@/api/projects";
import { useToast } from "@/hooks/useToast";
import { FilePlus, ArrowUp } from "lucide-react";

export default function CreateProjectPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await createProjectDraft({
        title: "Untitled Project", // Default title for now
        description: prompt,
        visibility: "private",
      });
      navigate("/projects/drafts");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create project",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-6 pt-4">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-1">New project</h1>
        <p className="text-muted-foreground mb-8">Start by writing a prompt</p>
      </div>
      <div className="flex w-full min-h-[70vh] items-center justify-center">
        <div className="mb-10 w-full max-w-2xl mx-auto">
          <div className="w-full text-left">
            <h2 className="text-2xl font-semibold text-white mb-2">Start your project</h2>
            <p className="text-muted-foreground mb-8">Start your first project by describing what you need.</p>
          </div>
          <div className="relative w-full">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Build a web-based dashboard for my HR department to track and manage job applicants through different stages of the hiring process (e.g., Applied, Phone Screen, Interview, Offer, Hired). It should support real-time viewing and updating of applicant data."
              className="border border-[#B3B3B5] rounded-xl bg-transparent p-5 pr-20 text-white min-h-[80px] text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-white placeholder:text-muted-foreground"
              disabled={loading}
              maxLength={1000}
              rows={5}
            />
            <button
              className="absolute bottom-3 right-3 bg-white hover:bg-gray-200 text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors focus:outline-none disabled:opacity-60 m-2"
              aria-label="Create project"
              onClick={handleCreate}
              disabled={!prompt.trim() || loading}
              type="button"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 