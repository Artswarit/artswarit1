
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Heart, MessageCircle, Send, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface SavedArtist {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  completedProjects: number;
  avgRating: number;
  hourlyRate: string;
  specialties: string[];
  lastActive: string;
}

const SavedArtists = () => {
  const [savedArtists] = useState<SavedArtist[]>([
    {
      id: "1",
      name: "Alex Rivera",
      category: "Musician",
      imageUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      rating: 4.8,
      completedProjects: 23,
      avgRating: 4.7,
      hourlyRate: "₹2,500/hour",
      specialties: ["Pop", "Rock", "Electronic"],
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Maya Johnson",
      category: "Writer",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      rating: 4.9,
      completedProjects: 31,
      avgRating: 4.8,
      hourlyRate: "₹1,800/hour",
      specialties: ["Fantasy", "Sci-Fi", "Young Adult"],
      lastActive: "1 day ago"
    },
    {
      id: "3",
      name: "Jordan Smith",
      category: "Rapper",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      rating: 4.6,
      completedProjects: 18,
      avgRating: 4.5,
      hourlyRate: "₹3,000/hour",
      specialties: ["Hip-Hop", "Conscious Rap", "Freestyle"],
      lastActive: "5 hours ago"
    }
  ]);

  const [selectedArtist, setSelectedArtist] = useState<SavedArtist | null>(null);
  const [projectRequest, setProjectRequest] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: ""
  });

  const handleSendProjectRequest = () => {
    console.log("Sending project request:", projectRequest, "to artist:", selectedArtist?.name);
    // Here you would integrate with your backend to send the project request
    setProjectRequest({ title: "", description: "", budget: "", deadline: "", category: "" });
    setSelectedArtist(null);
  };

  const handleRemoveArtist = (artistId: string) => {
    console.log("Removing artist:", artistId);
    // Here you would update the saved artists list
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Saved Artists</h2>
          <p className="text-muted-foreground">Artists you've saved for future projects</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/explore">Browse More Artists</Link>
        </Button>
      </div>

      {savedArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                    <CardDescription>{artist.category}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArtist(artist.id)}
                  >
                    <Heart className="h-4 w-4 fill-current text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{artist.avgRating}</span>
                    <span className="text-muted-foreground">({artist.completedProjects} projects)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{artist.lastActive}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {artist.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {artist.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{artist.specialties.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="text-sm font-medium text-green-600">
                  {artist.hourlyRate}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedArtist(artist)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Request Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Project Request</DialogTitle>
                        <DialogDescription>
                          Send a project request to {selectedArtist?.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Project Title</Label>
                          <Input
                            id="title"
                            value={projectRequest.title}
                            onChange={(e) => setProjectRequest({...projectRequest, title: e.target.value})}
                            placeholder="Enter project title"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select onValueChange={(value) => setProjectRequest({...projectRequest, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="budget">Budget</Label>
                          <Input
                            id="budget"
                            value={projectRequest.budget}
                            onChange={(e) => setProjectRequest({...projectRequest, budget: e.target.value})}
                            placeholder="e.g., ₹10,000 - ₹25,000"
                          />
                        </div>

                        <div>
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={projectRequest.deadline}
                            onChange={(e) => setProjectRequest({...projectRequest, deadline: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Project Description</Label>
                          <Textarea
                            id="description"
                            value={projectRequest.description}
                            onChange={(e) => setProjectRequest({...projectRequest, description: e.target.value})}
                            placeholder="Describe your project requirements..."
                            rows={3}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedArtist(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendProjectRequest}>
                          Send Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/artist/${artist.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No saved artists yet</h3>
          <p className="text-muted-foreground mb-4">Start exploring and save artists you'd like to work with</p>
          <Button asChild>
            <Link to="/explore">Explore Artists</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedArtists;
