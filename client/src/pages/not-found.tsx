import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold font-display text-foreground">404 Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The ritual you seek does not exist in this realm.
          </p>
          <div className="mt-6">
             <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
               Return to Safety
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
