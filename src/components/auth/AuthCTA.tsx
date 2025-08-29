import React from 'react';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export default function AuthCTA() {
  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800">
          Sign in to continue
        </h2>
        <p className="text-neutral-600">
          Access the POS system and manage your transactions securely.
        </p>
        
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          
          <Link href="/signup">
            <Button variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}