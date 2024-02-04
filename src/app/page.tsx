import { Button } from "~/components/ui/button";
import Link from "next/link";
export default async function Home() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <h1 className="text-5xl">Your All-in-one-Study AI Assistant ✨</h1>
      <Link href="signup">
        <Button>Get Started</Button>
      </Link>
    </div>
  );
}
