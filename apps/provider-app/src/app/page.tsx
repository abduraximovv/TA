import { Button, Card } from "@repo/ui";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-3xl font-display font-semibold text-primary mb-4">Welcome to Silk Road Provider</h1>
        <p className="text-gray-600 mb-6">Digital Tourism Ecosystem</p>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button>Get Started</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary">Apply as Provider</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
