import AuthorWorkspace from "./AuthorWorkspace";

export const metadata = {
  title: "Author Workspace | NeuroWire News",
  description: "Write, save and submit articles to the NeuroWire newsroom.",
  robots: { index: false, follow: false },
};

export default function AuthorPage() {
  return <AuthorWorkspace />;
}
