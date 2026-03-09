
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Download } from 'lucide-react';

interface BulkActionsProps {
  selectedArtworks: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, options?: any) => void;
  isLoading?: boolean;
}

const ArtworkBulkActions = ({ selectedArtworks, onClearSelection, onBulkAction, isLoading = false }: BulkActionsProps) => {
  if (selectedArtworks.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl sticky bottom-4 z-50 shadow-2xl shadow-primary/10 mx-2 sm:mx-0 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-6 px-2">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-primary/60">Selection</span>
              <span className="text-sm sm:text-base font-black text-primary">
                {selectedArtworks.length} {selectedArtworks.length !== 1 ? 'Artworks' : 'Artwork'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection} 
              className="h-12 px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={isLoading}
              className="h-14 flex-1 sm:flex-initial px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-lg transition-all active:scale-95"
              onClick={() => onBulkAction('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={isLoading}
                  className="h-14 flex-1 sm:flex-initial px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-destructive/20 transition-all active:scale-95"
                >
                  {isLoading
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    : <Trash2 className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[92vw] max-w-md rounded-[2.5rem] border-none shadow-2xl backdrop-blur-xl bg-background/95 p-8">
                <AlertDialogHeader className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                    <Trash2 className="h-8 w-8 text-destructive" />
                  </div>
                  <AlertDialogTitle className="text-2xl font-black text-center uppercase tracking-tight">Delete Selected Artworks</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-muted-foreground text-base font-medium leading-relaxed">
                    Are you sure you want to delete <span className="text-foreground font-black">{selectedArtworks.length}</span> selected artwork{selectedArtworks.length !== 1 ? 's' : ''}? 
                    This action is permanent and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
                  <AlertDialogCancel className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-border/50 hover:bg-muted transition-all">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onBulkAction('delete')}
                    className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20 transition-all"
                  >
                    Delete Now
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
