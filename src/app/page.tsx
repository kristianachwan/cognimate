"use client";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAtom } from "jotai/react";
import { usernameAtom, registeredAtom } from "~/app/state/user";

export default function Home() {
  const [registered, setRegistered] = useAtom(registeredAtom);
  const [username, setUsername] = useAtom(usernameAtom);
  console.log(registered);
  return (
    <div className="h-screen">
      <Image
        className="t-0 -z-10 h-screen w-screen animate-pulse bg-transparent"
        src={"/circle-1.png"}
        fill={true}
        alt="background gif"
      />
      <Image
        className="t-0 -z-10 h-screen w-screen animate-pulse bg-transparent delay-100"
        src={"/circle-2.png"}
        fill={true}
        alt="background gif"
      />
      <Image
        className="t-0 -z-10 h-screen w-screen animate-pulse bg-transparent delay-200"
        src={"/circle-3.png"}
        fill={true}
        alt="background gif"
      />
      <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-10">
        {!registered && (
          <>
            <h1 className="text-6xl font-bold">Cognimate 🤖.</h1>
            <p className="text-3xl">
              Your all-in-one AI Study Assistant designed to elevate your
              learning experience ✨
            </p>
            <Link href="signup">
              <Button>Get Started</Button>
            </Link>
          </>
        )}
        {registered && (
          <>
            <h1 className="text-6xl font-bold"> {`Hey ${username}!`}</h1>
            <p className="text-3xl">
              Your all-in-one AI Study Assistant designed to elevate your
              learning experience ✨
            </p>
            <Link href="signup">
              <Button>Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
