
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Clock, Users, Star, Filter, Search } from 'lucide-react';
import { useState } from 'react';

const Events = () => {
  const [events] = useState([
    {
      id: '1',
      title: 'Digital Art Exhibition 2024',
      type: 'Exhibition',
      date: 'Dec 20, 2024',
      time: '6:00 PM - 10:00 PM',
      location: 'Modern Art Gallery, NYC',
      price: 'Free',
      attendees: 245,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      organizer: 'NYC Art Collective',
      description: 'Experience the latest in digital art from emerging and established artists.'
    },
    {
      id: '2',
      title: 'Street Art Festival',
      type: 'Festival',
      date: 'Dec 25, 2024',
      time: '12:00 PM - 8:00 PM',
      location: 'Downtown District',
      price: '$25',
      attendees: 1200,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      organizer: 'Street Art Foundation',
      description: 'A celebration of urban art with live painting, workshops, and performances.'
    },
    {
      id: '3',
      title: 'Photography Workshop',
      type: 'Workshop',
      date: 'Jan 5, 2025',
      time: '2:00 PM - 5:00 PM',
      location: 'Creative Studio, LA',
      price: '$75',
      attendees: 30,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=250&fit=crop',
      organizer: 'Pro Photo Academy',
      description: 'Learn advanced photography techniques from professional photographers.'
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const eventTypes = ['All', 'Exhibition', 'Workshop', 'Festival', 'Gallery Opening', 'Art Fair'];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterEvents(term, selectedType);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    filterEvents(searchTerm, type);
  };

  const filterEvents = (search: string, type: string) => {
    let filtered = events;
    
    if (search) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase()) ||
        event.organizer.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (type !== 'All') {
      filtered = filtered.filter(event => event.type === type);
    }
    
    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Art Events & Exhibitions</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover art events, exhibitions, workshops, and galleries near you
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events, locations, organizers..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <Button className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Event */}
          {filteredEvents.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px]">
                  <div className="p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-white/20 text-white">Featured Event</Badge>
                    <h2 className="text-3xl font-bold mb-4">{filteredEvents[0].title}</h2>
                    <p className="text-white/90 mb-6">{filteredEvents[0].description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{filteredEvents[0].date} • {filteredEvents[0].time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{filteredEvents[0].location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{filteredEvents[0].attendees} attending</span>
                      </div>
                    </div>
                    
                    <Button className="w-fit bg-white text-purple-600 hover:bg-gray-100">
                      Get Tickets • {filteredEvents[0].price}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <img 
                      src={filteredEvents[0].image} 
                      alt={filteredEvents[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="text-white font-medium">{filteredEvents[0].rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <span className="text-sm text-gray-600">{filteredEvents.length} events found</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(1).map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2">{event.type}</Badge>
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      {event.rating}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-600">{event.price}</span>
                      <Button size="sm">Get Tickets</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Event Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Browse by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {eventTypes.slice(1).map((type) => (
                  <Button 
                    key={type} 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleTypeFilter(type)}
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">{type}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Event CTA */}
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Host Your Own Event</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Whether it's an exhibition, workshop, or art fair, our platform helps you reach the right audience and manage your event.
              </p>
              <Button size="lg">Create Event</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
