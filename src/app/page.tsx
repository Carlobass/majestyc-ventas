

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Edit, MessageCircle, X, ShoppingCart, Package, Clock, Globe, Moon, Sun, Users, Link2, Send } from "lucide-react"
import { useTheme } from "next-themes"
import { AddProductForm } from "@/components/add-product-form"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  category: string
  description: string
  boxType: string
  unitType: string
  stBun: number
  price: number
}

interface CartItem extends Product {
  quantity: number
}

interface UIText {
  title: string
  subtitle: string
  cartButton: string
  searchPlaceholder: string
  categoryAll: string
  categoryRoses: string
  categoryTulips: string
  categoryLilies: string
  categoryMixed: string
  deliveryText1: string
  deliveryText2: string
  deleteButton: string
  editButton: string
  saveButton: string
  cancelButton: string
  confirmDelete: string
  productAdded: string
  productRemoved: string
  orderConfirmation: string
  emptyCart: string
  noProducts: string
  promoTitle: string
  promoText: string
  daysLeft: string
  hoursLeft: string
  minutesLeft: string
  secondsLeft: string
}

const defaultUIText: { [key: string]: UIText } = {
  es: {
    title: "Flora Majestyc - Flores Premium",
    subtitle: "Catálogo de productos mayoristas",
    cartButton: "Pedir por WhatsApp",
    searchPlaceholder: "Buscar productos...",
    categoryAll: "Todos",
    categoryRoses: "Rosas",
    categoryTulips: "Tulipanes",
    categoryLilies: "Lirios",
    categoryMixed: "Mixto",
    deliveryText1: "Entrega: Jueves 15 de Junio",
    deliveryText2: "Pedido mínimo: $1000",
    deleteButton: "Eliminar",
    editButton: "Editar",
    saveButton: "Guardar",
    cancelButton: "Cancelar",
    confirmDelete: "¿Estás seguro de que quieres eliminar este producto?",
    productAdded: "Producto añadido al carrito",
    productRemoved: "Producto eliminado del carrito",
    orderConfirmation: "Tu pedido ha sido enviado por WhatsApp",
    emptyCart: "Tu carrito está vacío",
    noProducts: "No hay productos disponibles",
    promoTitle: "Oferta Especial",
    promoText: "20% de descuento en rosas rojas",
    daysLeft: "Días",
    hoursLeft: "Horas",
    minutesLeft: "Minutos",
    secondsLeft: "Segundos"
  },
  en: {
    title: "Flora Majestyc - Premium Flowers",
    subtitle: "Wholesale product catalog",
    cartButton: "Order via WhatsApp",
    searchPlaceholder: "Search products...",
    categoryAll: "All",
    categoryRoses: "Roses",
    categoryTulips: "Tulips",
    categoryLilies: "Lilies",
    categoryMixed: "Mixed",
    deliveryText1: "Delivery: Thursday June 15",
    deliveryText2: "Minimum order: $1000",
    deleteButton: "Delete",
    editButton: "Edit",
    saveButton: "Save",
    cancelButton: "Cancel",
    confirmDelete: "Are you sure you want to delete this product?",
    productAdded: "Product added to cart",
    productRemoved: "Product removed from cart",
    orderConfirmation: "Your order has been sent via WhatsApp",
    emptyCart: "Your cart is empty",
    noProducts: "No products available",
    promoTitle: "Special Offer",
    promoText: "20% off on red roses",
    daysLeft: "Days",
    hoursLeft: "Hours",
    minutesLeft: "Minutes",
    secondsLeft: "Seconds"
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isClientView, setIsClientView] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [language, setLanguage] = useState("es")
  const [promoEndDate, setPromoEndDate] = useState<string | null>(null)
  const [uiText, setUiText] = useState<UIText>(defaultUIText.es)
  const [customUiText, setCustomUiText] = useState<UIText | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTitle, setAlertTitle] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showClientListDialog, setShowClientListDialog] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const currentText = customUiText || uiText

  // Cargar datos iniciales
  useEffect(() => {
    // Verificar si estamos en vista de cliente
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    
    if (id) {
      setIsClientView(true)
      setClientId(id)
      fetchClientData(id)
    } else {
      // Cargar productos para vista de administrador
      fetchProducts()
    }
  }, [])

  // Efecto para filtrar productos
  useEffect(() => {
    let filtered = products
    
    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  // Efecto para cuenta regresiva de promoción
  useEffect(() => {
    if (!promoEndDate) return
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const endDate = new Date(promoEndDate).getTime()
      const distance = endDate - now
      
      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [promoEndDate])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      setAlertMessage("No se pudieron cargar los productos. Por favor, recarga la página.")
      setAlertTitle("Error")
      setShowAlert(true)
    }
  }

  const fetchClientData = async (id: string) => {
    try {
      const response = await fetch(`/api/client-list?id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch client data')
      const data = await response.json()
      
      setProducts(data.products)
      setLanguage(data.language || 'es')
      setPromoEndDate(data.promoEndDate || null)
      setCustomUiText(data.uiText || null)
    } catch (error) {
      console.error("Could not initialize client view.", error)
      setAlertMessage(`No se pudo cargar la lista de precios. ${error instanceof Error ? error.message : 'El enlace puede ser inválido o haber expirado.'}`)
      setAlertTitle('Error')
      setShowAlert(true)
    }
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      
      if (!response.ok) throw new Error('Failed to add product')
      
      const newProduct = await response.json()
      setProducts([...products, newProduct])
      
      toast({
        title: "Producto añadido",
        description: "El producto ha sido añadido correctamente",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto",
        variant: "destructive",
      })
    }
  }

  const updateProduct = async (id: number, product: Omit<Product, 'id'>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      
      if (!response.ok) throw new Error('Failed to update product')
      
      const updatedProduct = await response.json()
      setProducts(products.map(p => p.id === id ? updatedProduct : p))
      setEditIndex(null)
      
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (index: number) => {
    try {
      const product = products[index]
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete product')
      
      setProducts(products.filter((_, i) => i !== index))
      setDeleteIndex(null)
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }
    
    toast({
      title: currentText.productAdded,
      description: product.description,
    })
  }

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
    
    toast({
      title: currentText.productRemoved,
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const boxPrice = item.price * item.stBun
      return total + (boxPrice * item.quantity)
    }, 0)
  }

  const sendOrderViaWhatsApp = () => {
    if (cartItems.length === 0) return
    
    const phoneNumber = "19297456499" // Número de WhatsApp actualizado
    const orderDetails = cartItems.map(item => {
      const boxPrice = item.price * item.stBun
      return `${item.description} - Cantidad: ${item.quantity} - Precio: $${boxPrice.toFixed(2)} c/u`
    }).join('\n')
    
    const total = calculateTotal()
    const message = `Nuevo pedido:\n\n${orderDetails}\n\nTotal: $${total.toFixed(2)}`
    
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
    
    toast({
      title: currentText.orderConfirmation,
    })
    
    setCartItems([])
  }

  const generateClientLink = async () => {
    try {
      const response = await fetch('/api/client-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          language,
          promoEndDate,
          uiText: customUiText || defaultUIText[language]
        }),
      })
      
      if (!response.ok) throw new Error('Failed to generate client link')
      
      const data = await response.json()
      const link = `${window.location.origin}?id=${data.id}`
      setGeneratedLink(link)
      setShowLinkDialog(true)
    } catch (error) {
      console.error("Error generating client link:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el enlace para cliente",
        variant: "destructive",
      })
    }
  }

  const sendListViaWhatsApp = () => {
    const phoneNumber = "19297456499" // Número de WhatsApp actualizado
    const productList = products.map(product => {
      const boxPrice = product.price * product.stBun
      return `${product.description} - ${product.category} - $${boxPrice.toFixed(2)} por caja`
    }).join('\n')
    
    const message = `🌸 *Flora Majestyc - Catálogo de Productos*\n\n${productList}\n\n📞 Para realizar tu pedido, responde a este mensaje\n\n*Entrega:* ${currentText.deliveryText1}\n*Pedido mínimo:* ${currentText.deliveryText2}`
    
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
    
    toast({
      title: "Lista enviada por WhatsApp",
      description: "La lista de productos ha sido enviada",
    })
  }

  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-foreground">{currentText.title}</h1>
            <p className="text-muted-foreground">{currentText.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            
            {!isClientView && (
              <div className="flex items-center gap-2">
                <span>ES</span>
                <Switch
                  checked={language === "en"}
                  onCheckedChange={(checked) => setLanguage(checked ? "en" : "es")}
                />
                <span>EN</span>
              </div>
            )}
          </div>
        </header>

        {promoEndDate && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">{currentText.promoTitle}</h3>
                  <p className="text-red-600 dark:text-red-300">{currentText.promoText}</p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">{timeLeft.days}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{currentText.daysLeft}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">{timeLeft.hours}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{currentText.hoursLeft}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">{timeLeft.minutes}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{currentText.minutesLeft}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">{timeLeft.seconds}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{currentText.secondsLeft}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección de Crear Lista de Cliente - Solo visible en modo administrador */}
        {!isClientView && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Users className="h-5 w-5" />
                Crear Lista de Cliente
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Genera y comparte la lista de productos con tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={generateClientLink}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Generar Enlace para Cliente
                </Button>
                <Button 
                  onClick={sendListViaWhatsApp}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Lista por WhatsApp
                </Button>
              </div>
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-300">
                <p>• <strong>Generar Enlace:</strong> Crea una URL única que puedes compartir con tus clientes</p>
                <p>• <strong>Enviar por WhatsApp:</strong> Comparte directamente la lista de productos</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={currentText.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">{currentText.categoryAll}</TabsTrigger>
                  <TabsTrigger value="roses">{currentText.categoryRoses}</TabsTrigger>
                  <TabsTrigger value="tulips">{currentText.categoryTulips}</TabsTrigger>
                  <TabsTrigger value="lilies">{currentText.categoryLilies}</TabsTrigger>
                  <TabsTrigger value="mixed">{currentText.categoryMixed}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{currentText.noProducts}</h3>
                  <p className="text-muted-foreground">Intenta cambiar los filtros de búsqueda o categoría</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => {
                  const originalIndex = products.findIndex(p => p.id === product.id)
                  const isEditing = editIndex === originalIndex
                  
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary">{product.category}</Badge>
                          {!isClientView && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditIndex(originalIndex)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteIndex(originalIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <AddProductForm
                            product={product}
                            onSubmit={(updatedProduct) => updateProduct(product.id, updatedProduct)}
                            onCancel={() => setEditIndex(null)}
                          />
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg mb-2">{product.description}</h3>
                            <div className="text-sm text-muted-foreground mb-4">
                              <p>{product.boxType} - {product.unitType}</p>
                              <p>{product.stBun} unidades por caja</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xl font-bold">
                                ${product.price.toFixed(2)} / {product.unitType}
                              </div>
                              <Button
                                onClick={() => addToCart(product)}
                                size="sm"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Añadir
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <div className="lg:w-96">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cartItemsCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">{currentText.emptyCart}</h3>
                    <p className="text-muted-foreground">Añade productos para empezar</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => {
                        const boxPrice = item.price * item.stBun
                        const totalPrice = boxPrice * item.quantity
                        
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${boxPrice.toFixed(2)} x {item.quantity} = ${totalPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="mb-4">
                        <div>
                          <Label>{currentText.deliveryText1}</Label>
                        </div>
                        <div>
                          <Label>{currentText.deliveryText2}</Label>
                        </div>
                      </div>
                      
                      {/* Botón de WhatsApp solo visible en vista de cliente */}
                      {isClientView && (
                        <Button
                          onClick={sendOrderViaWhatsApp}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={cartItemsCount === 0}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {currentText.cartButton}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {!isClientView && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Añadir nuevo producto</CardTitle>
                <CardDescription>
                  Completa el formulario para añadir un nuevo producto al catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddProductForm onSubmit={addProduct} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              {language === 'es' ? 'Entendido' : 'Understood'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{currentText.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{currentText.cancelButton}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteProduct(deleteIndex!)}>
              {currentText.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generated Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enlace generado para cliente</DialogTitle>
            <DialogDescription>
              Comparte este enlace con tu cliente para que pueda ver el catálogo
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={generatedLink} readOnly />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink)
                toast({
                  title: "Enlace copiado",
                  description: "El enlace ha sido copiado al portapapeles",
                })
              }}
            >
              Copiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}