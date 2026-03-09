
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, Star, Filter, Search, Package } from 'lucide-react';
import { useState } from 'react';

const Merchandise = () => {
  const [products] = useState([
    {
      id: '1',
      name: 'Abstract Art Print T-Shirt',
      artist: 'Maya Johnson',
      price: 29.99,
      originalPrice: 39.99,
      category: 'Apparel',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      inStock: true,
      featured: true,
      description: 'High-quality cotton t-shirt featuring an exclusive abstract design'
    },
    {
      id: '2',
      name: 'Digital Art Coffee Mug',
      artist: 'Alex Rivera',
      price: 19.99,
      category: 'Home & Living',
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1572119865084-43c3fdb3b3f3?w=400&h=400&fit=crop',
      inStock: true,
      featured: false,
      description: 'Ceramic mug with vibrant digital art print, dishwasher safe'
    },
    {
      id: '3',
      name: 'Artist Sketchbook Set',
      artist: 'Jordan Smith',
      price: 45.99,
      category: 'Art Supplies',
      rating: 4.7,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
      inStock: true,
      featured: true,
      description: 'Premium paper sketchbook with custom cover design'
    },
    {
      id: '4',
      name: 'Limited Edition Art Poster',
      artist: 'Sam Wilson',
      price: 35.99,
      category: 'Prints',
      rating: 4.6,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      inStock: false,
      featured: false,
      description: 'Museum-quality print on premium paper, limited to 100 copies'
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const categories = ['All', 'Apparel', 'Home & Living', 'Art Supplies', 'Prints', 'Accessories'];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterProducts(term, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterProducts(searchTerm, category);
  };

  const filterProducts = (search: string, category: string) => {
    let filtered = products;
    
    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.artist.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category !== 'All') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    setFilteredProducts(filtered);
  };

  const addToCart = (productId: string) => {
    if (!cart.includes(productId)) {
      setCart([...cart, productId]);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const featuredProducts = filteredProducts.filter(product => product.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Art Merchandise Store</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Shop exclusive merchandise from your favorite artists
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products, artists, categories..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <Button className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-purple-600">Featured</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {product.originalPrice && (
                        <Badge className="absolute bottom-2 left-2 bg-red-500">
                          Sale
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {product.artist}</p>
                      <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full flex items-center gap-2"
                        disabled={!product.inStock || cart.includes(product.id)}
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {cart.includes(product.id) ? 'Added to Cart' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Products</h2>
              <span className="text-sm text-gray-600">{filteredProducts.length} products found</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-purple-600">Featured</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {product.artist}</p>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold">${product.price}</span>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={!product.inStock || cart.includes(product.id)}
                      onClick={() => addToCart(product.id)}
                    >
                      {cart.includes(product.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Shop by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(1).map((category) => (
                  <Button 
                    key={category} 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    <Package className="h-6 w-6" />
                    <span className="text-sm">{category}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart Summary */}
          {cart.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Cart ({cart.length} items)</span>
                  </div>
                  <Button>View Cart</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Merchandise;
