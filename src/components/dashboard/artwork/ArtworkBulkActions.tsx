
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, EyeOff, Download, Archive } from 'lucide-react';

interface BulkActionsProps {
  selectedArtworks: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, options?: any) => void;
}

const ArtworkBulkActions = ({ selectedArtworks, onClearSelection, onBulkAction }: BulkActionsProps) => {
  if (selectedArtworks.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedArtworks.length} artwork{selectedArtworks.length !== 1 ? 's' : ''} selected
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear selection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => onBulkAction('changeStatus', { status: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="pending">Set Pending</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('toggleVisibility')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Toggle Visibility
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('archive')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Artworks</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedArtworks.length} selected artwork{selectedArtworks.length !== 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onBulkAction('delete')}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkBulkActions;
