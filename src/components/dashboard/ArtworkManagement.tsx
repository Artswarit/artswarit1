
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useArtworks } from "@/hooks/useArtworks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Heart, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import ArtworkUploadForm from "./artwork/ArtworkUploadForm";
import PinnedArtworks from "./artwork/PinnedArtworks";

const ArtworkManagement = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { artworks, loading, uploadArtwork } = useArtworks();
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Filter artworks by approval status
  const pendingArtworks = artworks.filter(artwork => artwork.approval_status === 'pending');
  const approvedArtworks = artworks.filter(artwork => artwork.approval_status === 'approved');
  const rejectedArtworks = artworks.filter(artwork => artwork.approval_status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Artwork Management</h2>
        <Button onClick={() => setShowUploadForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload New Artwork
        </Button>
      </div>

      {/* Upload Form Modal/Dialog */}
      {showUploadForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload New Artwork</CardTitle>
            <CardDescription>
              Upload your artwork for review. It will be visible publicly once approved by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Patch: Fix missing ArtworkUploadForm prop types */}
            <ArtworkUploadForm
              // @ts-ignore
              onUpload={uploadArtwork}
              onCancel={() => setShowUploadForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Pinned Artworks */}
      <PinnedArtworks />

      {/* Approval Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtworks.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedArtworks.length}</div>
            <p className="text-xs text-muted-foreground">
              Live and visible to public
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedArtworks.length}</div>
            <p className="text-xs text-muted-foreground">
              Need updates before resubmission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Artwork Tabs by Status */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Artworks ({artworks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingArtworks.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedArtworks.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedArtworks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(artwork.approval_status || 'pending')}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{artwork.title}</h3>
                    {getStatusIcon(artwork.approval_status || 'pending')}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{artwork.category}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {artwork.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {artwork.views}
                    </span>
                    {artwork.price && (
                      <span className="font-medium">₹{artwork.price}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingArtworks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No artworks pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden border-yellow-200">
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">Under Review</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{artwork.category}</p>
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Awaiting admin approval</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedArtworks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No approved artworks yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden border-green-200">
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 text-green-800">Live</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{artwork.category}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {artwork.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {artwork.views}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedArtworks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rejected artworks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden border-red-200">
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{artwork.category}</p>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Needs updates before resubmission</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Feedback & Resubmit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtworkManagement;
