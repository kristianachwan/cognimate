import { Button } from "~/components/ui/button";
import Link from "next/link";
export default async function Home() {
  return (
    <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-10">
      <h1 className="text-6xl font-bold">Cognimate 🤖.</h1>
      <p className="text-3xl">
        Your all-in-one AI Study Assistant designed to elevate your learning
        experience ✨
      </p>
      <Link href="signup">
        <Button>Get Started</Button>
      </Link>
    </div>
  );
}
