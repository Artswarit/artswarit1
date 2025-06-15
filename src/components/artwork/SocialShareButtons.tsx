
import { Twitter, Facebook, Pinterest, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  imageUrl: string;
}

const SocialShareButtons = ({ url, title, imageUrl }: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImageUrl = encodeURIComponent(imageUrl);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: 'Link Copied!',
          description: 'The artwork link has been copied to your clipboard.',
        });
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="transition-colors hover:bg-blue-50"
      >
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="transition-colors hover:bg-blue-50"
      >
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <Facebook className="h-4 w-4 text-[#1877F2]" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="transition-colors hover:bg-red-50"
      >
        <a href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImageUrl}&description=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest">
          <Pinterest className="h-4 w-4 text-[#E60023]" />
        </a>
      </Button>
      <Button variant="outline" size="icon" onClick={copyToClipboard} className="transition-colors hover:bg-gray-100" aria-label="Copy link">
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;
