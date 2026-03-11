import ContentUploadForm from "@/components/admin/content/content-upload-form";

export default function DashboardNewContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400">New Content</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--dash-text)]">Upload a new video</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--dash-muted)]">
          Add custom content with a video and thumbnail. This will show up in the Content table immediately after upload.
        </p>
      </div>
      <ContentUploadForm />
    </div>
  );
}
