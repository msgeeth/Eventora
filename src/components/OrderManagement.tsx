import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Calendar,
  DollarSign
} from 'lucide-react'

interface OrderManagementProps {
  providerId: string
}

export function OrderManagement({ providerId }: OrderManagementProps) {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [responseDialog, setResponseDialog] = useState({ open: false, order: null as any })
  const [responseData, setResponseData] = useState({ response: '', message: '' })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      // Mock orders for demonstration
      const mockOrders = [
        {
          id: 'order_1',
          buyer_name: 'Sarah & John',
          buyer_email: 'sarah.john@email.com',
          service_name: 'Wedding Photography Package',
          event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          event_type: 'Wedding',
          message: 'We would like to book your premium wedding photography package for our ceremony and reception.',
          status: 'pending_acceptance',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          acceptance_deadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          amount: 150000,
          advance_percentage: 30
        },
        {
          id: 'order_2',
          buyer_name: 'Corporate Event Team',
          buyer_email: 'events@company.com',
          service_name: 'Corporate Event Photography',
          event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          event_type: 'Corporate',
          message: 'Need photography coverage for our annual company event.',
          status: 'accepted',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 75000,
          advance_percentage: 30,
          response_message: 'Happy to provide photography for your corporate event!'
        },
        {
          id: 'order_3',
          buyer_name: 'Mike Birthday',
          buyer_email: 'mike@email.com',
          service_name: 'Birthday Party Photography',
          event_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          event_type: 'Birthday',
          message: 'Birthday party photography for my son\'s 10th birthday.',
          status: 'completed',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 50000,
          advance_percentage: 30,
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderResponse = async (orderId: string, response: 'accept' | 'reject') => {
    try {
      // In a real app, this would call the backend API
      console.log('Responding to order:', { orderId, response, message: responseData.message })
      
      // Update the order status locally
      setOrders(orders.map((order: any) => 
        order.id === orderId 
          ? { 
              ...order, 
              status: response === 'accept' ? 'accepted' : 'rejected',
              response_message: responseData.message,
              responded_at: new Date().toISOString()
            }
          : order
      ))
      
      setResponseDialog({ open: false, order: null })
      setResponseData({ response: '', message: '' })
    } catch (error) {
      console.error('Error responding to order:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_acceptance':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Response</Badge>
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime()
    const deadlineTime = new Date(deadline).getTime()
    const diff = deadlineTime - now
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }

  const filterOrders = (status: string) => {
    if (status === 'pending') {
      return orders.filter((order: any) => order.status === 'pending_acceptance')
    } else if (status === 'active') {
      return orders.filter((order: any) => order.status === 'accepted')
    } else if (status === 'completed') {
      return orders.filter((order: any) => order.status === 'completed')
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
          <TabsTrigger value="pending">
            Pending ({filterOrders('pending').length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({filterOrders('active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterOrders('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {filterOrders('pending').map((order: any) => {
              const timeRemaining = getTimeRemaining(order.acceptance_deadline)
              const isExpired = timeRemaining === 'Expired'
              
              return (
                <Card key={order.id} className={isExpired ? 'border-red-200 bg-red-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <CardDescription>
                      From: {order.buyer_name} • Service: {order.service_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isExpired && (
                      <Alert className="mb-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This order has expired. Your rating may be affected by late responses.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Event Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(order.event_date).toLocaleDateString()}
                          </p>
                          <p>Type: {order.event_type}</p>
                          <p>Contact: {order.buyer_email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Order Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><DollarSign className="h-3 w-3 inline mr-1" />
                            LKR {order.amount.toLocaleString()}
                          </p>
                          <p>Advance: LKR {(order.amount * order.advance_percentage / 100).toLocaleString()} ({order.advance_percentage}%)</p>
                          <p className={isExpired ? 'text-red-600 font-medium' : 'text-amber-600'}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {timeRemaining}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Customer Message</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{order.message}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setResponseDialog({ open: true, order })
                              setResponseData({ response: 'accept', message: '' })
                            }}
                            disabled={isExpired}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept Order
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              setResponseDialog({ open: true, order })
                              setResponseData({ response: 'reject', message: '' })
                            }}
                            disabled={isExpired}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject Order
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filterOrders('pending').length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No Pending Orders</h3>
                  <p className="text-gray-600 text-center">
                    New booking requests will appear here for your response.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

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
                    From: {order.buyer_name} • Service: {order.service_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Event Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(order.event_date).toLocaleDateString()}
                        </p>
                        <p>Type: {order.event_type}</p>
                        <p>Contact: {order.buyer_email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Payment Status</h4>
                      <div className="space-y-1 text-sm">
                        <p><DollarSign className="h-3 w-3 inline mr-1" />
                          Total: LKR {order.amount.toLocaleString()}
                        </p>
                        <p>Advance: LKR {(order.amount * order.advance_percentage / 100).toLocaleString()}</p>
                        <Badge className="bg-green-500">Advance Received</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {order.response_message && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Your Response</h4>
                      <p className="text-sm bg-green-50 border border-green-200 p-3 rounded">
                        {order.response_message}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message Customer
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Add to Calendar
                    </Button>
                    <Button>
                      Mark as Completed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterOrders('active').length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No Active Orders</h3>
                  <p className="text-gray-600 text-center">
                    Accepted orders will appear here.
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
                    From: {order.buyer_name} • Completed: {new Date(order.completed_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Service Provided</h4>
                      <p className="text-sm">{order.service_name}</p>
                      <p className="text-sm text-gray-600">{order.event_type} Event</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Earnings</h4>
                      <p className="text-lg font-bold text-green-600">
                        LKR {order.amount.toLocaleString()}
                      </p>
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
                    Your completed services will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialog.open} onOpenChange={(open) => setResponseDialog({ open, order: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseData.response === 'accept' ? 'Accept Order' : 'Reject Order'}
            </DialogTitle>
            <DialogDescription>
              {responseData.response === 'accept' 
                ? 'Confirm that you can provide this service and add a message for the customer.'
                : 'Please provide a reason for rejecting this order.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="response_message" className="text-sm font-medium">
                Message to Customer
              </label>
              <Textarea
                id="response_message"
                value={responseData.message}
                onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                placeholder={
                  responseData.response === 'accept'
                    ? "Thank you for choosing our services. We're excited to work with you!"
                    : "Unfortunately, we cannot provide this service..."
                }
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleOrderResponse(responseDialog.order?.id, responseData.response as 'accept' | 'reject')}
                className={responseData.response === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={responseData.response === 'reject' ? 'destructive' : 'default'}
                disabled={!responseData.message.trim()}
              >
                {responseData.response === 'accept' ? 'Accept Order' : 'Reject Order'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResponseDialog({ open: false, order: null })}
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