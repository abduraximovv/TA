import { Button, Card } from "@repo/ui";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary mb-4">Welcome to provider-app</h1>
        <p className="text-gray-600 mb-6">Digital Tourism Ecosystem</p>
        <div className="flex gap-4">
          <Button>Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </Card>
    </main>
  );
}
