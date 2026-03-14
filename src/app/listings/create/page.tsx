import { ListingForm } from '@/components/listings/listing-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateListingPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/seller">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Anunciar Jogo</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <ListingForm />
      </div>
    </div>
  );
}
