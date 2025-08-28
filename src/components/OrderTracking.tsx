import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Star, Clock, CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react'

interface OrderTrackingProps {
  userId: string
  userType: 'buyer' | 'service_provider'
}

export function OrderTracking({ userId, userType }: OrderTrackingProps) {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)
  const [reviewDialog, setReviewDialog] = useState({ open: false, order: null as any })
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      // Mock orders for demonstration
      const mockOrders = [
        {
          id: 'order_1',
          services: [
            { name: 'Wedding Photography', provider: 'John Photography', price: 150000 }
          ],
          status: 'pending_acceptance',
          created_at: new Date().toISOString(),
          event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 150000,
          advance_paid: false,
          acceptance_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          progress: 25
        },
        {
          id: 'order_2',
          services: [
            { name: 'Catering Service', provider: 'Elite Catering', price: 300000 },
            { name: 'Decoration', provider: 'Flower Paradise', price: 100000 }
          ],
          status: 'confirmed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          event_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 400000,
          advance_paid: true,
          progress: 75
        },
        {
          id: 'order_3',
          services: [
            { name: 'Birthday Photography', provider: 'Memories Studio', price: 75000 }
          ],
          status: 'completed',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          event_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 75000,
          advance_paid: true,
          progress: 100,
          can_review: true
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_acceptance':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Acceptance</Badge>
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusDescription = (order: any) => {
    switch (order.status) {
      case 'pending_acceptance':
        const hoursLeft = Math.max(0, Math.floor((new Date(order.acceptance_deadline).getTime() - Date.now()) / (1000 * 60 * 60)))
        return `Waiting for provider acceptance (${hoursLeft}h remaining)`
      case 'confirmed':
        return order.advance_paid ? 'Advance paid • Booking confirmed' : 'Advance payment pending'
      case 'completed':
        return 'Service completed successfully'
      case 'cancelled':
        return 'Order was cancelled'
      default:
        return 'Status unknown'
    }
  }

  const submitReview = async () => {
    try {
      // In a real app, this would submit to the backend
      console.log('Submitting review:', reviewData)
      
      // Update the order to mark as reviewed
      setOrders(orders.map((order: any) => 
        order.id === reviewDialog.order?.id 
          ? { ...order, can_review: false, reviewed: true }
          : order
      ))
      
      setReviewDialog({ open: false, order: null })
      setReviewData({ rating: 5, comment: '' })
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const filterOrders = (status: string) => {
    if (status === 'active') {
      return orders.filter((order: any) => 
        ['pending_acceptance', 'confirmed'].includes(order.status)
      )
    } else if (status === 'completed') {
      return orders.filter((order: any) => order.status === 'completed')
    } else if (status === 'cancelled') {
      return orders.filter((order: any) => order.status === 'cancelled')
    }
    return orders
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg mb-4">Loading orders...</h3>
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Orders ({filterOrders('active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterOrders('completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({filterOrders('cancelled').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {filterOrders('active').map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription>
                    Event Date: {new Date(order.event_date).toLocaleDateString()} • 
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} />
                    <p className="text-sm text-gray-600 mt-1">{getStatusDescription(order)}</p>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2 mb-4">
                    {order.services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.provider}</p>
                        </div>
                        <p className="font-medium">LKR {service.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Total Amount</span>
                      <span className="text-lg font-bold">LKR {order.total_amount.toLocaleString()}</span>
                    </div>
                    
                    {order.status === 'pending_acceptance' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          <p className="text-sm text-yellow-800">
                            Waiting for service providers to accept your booking request.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'confirmed' && !order.advance_paid && (
                      <Button className="w-full">
                        Pay Advance (LKR {(order.total_amount * 0.3).toLocaleString()})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterOrders('active').length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No Active Orders</h3>
                  <p className="text-gray-600 text-center">
                    You don't have any active orders at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {filterOrders('completed').map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription>
                    Event Date: {new Date(order.event_date).toLocaleDateString()} • 
                    Completed: {new Date(order.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Services List */}
                  <div className="space-y-2 mb-4">
                    {order.services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">LKR {service.price.toLocaleString()}</p>
                          {order.can_review && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewDialog({ open: true, order })}
                              className="mt-1"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Paid</span>
                      <span className="text-lg font-bold text-green-600">
                        LKR {order.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterOrders('completed').length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No Completed Orders</h3>
                  <p className="text-gray-600 text-center">
                    Your completed orders will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No Cancelled Orders</h3>
              <p className="text-gray-600 text-center">
                Any cancelled orders will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, order: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Share your feedback about the service you received
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`w-8 h-8 ${
                      star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="text-sm font-medium">
                Comment (Optional)
              </label>
              <Textarea
                id="comment"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your experience..."
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={submitReview} className="flex-1">
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => setReviewDialog({ open: false, order: null })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}