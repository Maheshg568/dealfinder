import { Loader2 } from 'lucide-react';

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600 font-medium">Searching across platforms...</span>
    </div>
  );
}
