"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  LogOut,
  DollarSign,
  Calendar,
  Users,
  Phone,
  MapPin,
  Eye,
  Download,
  TrendingUp,
  CheckCircle,
  Moon,
  Sun,
  Filter,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster, toast } from "sonner"

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  totalAmount: number
  registeredAt: string
}

interface Loan {
  id: string
  customerId: string
  customerName: string
  description: string
  amount: number
  date: string
  status: "pending" | "paid" | "overdue"
  createdAt: string
}

interface Payment {
  id: string
  loanId: string
  amount: number
  date: string
  note: string
  createdAt: string
}

interface DashboardProps {
  user: any
  onSignOut: () => void
}

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("customers")

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false)

  // Editing states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)

  // Form data
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    totalAmount: "",
  })

  const [loanForm, setLoanForm] = useState({
    customerId: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  })

  const { theme, setTheme } = useTheme()

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [user.email])

  const loadData = () => {
    try {
      const savedCustomers = localStorage.getItem(`customers_${user.email}`)
      const savedLoans = localStorage.getItem(`loans_${user.email}`)
      const savedPayments = localStorage.getItem(`payments_${user.email}`)

      if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
      if (savedLoans) setLoans(JSON.parse(savedLoans))
      if (savedPayments) setPayments(JSON.parse(savedPayments))
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const saveData = (type: string, data: any[]) => {
    try {
      localStorage.setItem(`${type}_${user.email}`, JSON.stringify(data))
      console.log(`✅ ${type} data saved successfully:`, data.length, "items")
    } catch (error) {
      console.error(`❌ Error saving ${type} data:`, error)
      toast.error(`Khalad ayaa dhacay markii la kaydiyay ${type}`)
    }
  }

  // Auto-save when data changes
  useEffect(() => {
    saveData("customers", customers)
  }, [customers, user.email])

  useEffect(() => {
    saveData("loans", loans)
  }, [loans, user.email])

  useEffect(() => {
    saveData("payments", payments)
  }, [payments, user.email])

  // Automatically mark loans as overdue
  useEffect(() => {
    if (loans.length === 0) return

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Compare dates only, ignore time

    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    let hasChanges = false

    const updatedLoans = loans.map((loan) => {
      // Only check pending loans
      if (loan.status === "pending") {
        const loanDate = new Date(loan.date)
        loanDate.setHours(0, 0, 0, 0)

        if (today.getTime() - loanDate.getTime() > thirtyDaysInMs) {
          hasChanges = true
          return { ...loan, status: "overdue" as const }
        }
      }
      return loan
    })

    if (hasChanges) {
      setLoans(updatedLoans)
    }
  }, [loans])

  // Customer functions
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
      toast.warning("Fadlan buuxi dhammaan goobaha muhiimka ah")
      return
    }

    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      address: customerForm.address.trim(),
      totalAmount: Number.parseFloat(customerForm.totalAmount) || 0,
      registeredAt: editingCustomer?.registeredAt || new Date().toISOString(),
    }

    let newCustomers: Customer[]
    if (editingCustomer) {
      newCustomers = customers.map((c) => (c.id === editingCustomer.id ? customerData : c))
    } else {
      newCustomers = [customerData, ...customers]
    }

    setCustomers(newCustomers)
    saveData("customers", newCustomers)
    resetCustomerForm()
    setIsCustomerDialogOpen(false)

    // Show success message
    toast.success(editingCustomer ? "Customer waa la cusboonaysiiyay!" : "Customer cusub waa la diwan geliyay!")
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      totalAmount: customer.totalAmount.toString(),
    })
    setIsCustomerDialogOpen(true)
  }

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Ma hubtaa in aad rabto in aad tirtirto customer-kan?")) {
      const newCustomers = customers.filter((c) => c.id !== id)
      const newLoans = loans.filter((l) => l.customerId !== id)
      const relatedLoanIds = loans.filter((l) => l.customerId === id).map((l) => l.id)
      const newPayments = payments.filter((p) => !relatedLoanIds.includes(p.loanId))

      setCustomers(newCustomers)
      setLoans(newLoans)
      setPayments(newPayments)
    }
  }

  const resetCustomerForm = () => {
    setCustomerForm({ name: "", phone: "", address: "", totalAmount: "" })
    setEditingCustomer(null)
  }

  // Loan functions
  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!loanForm.customerId || !loanForm.description.trim() || !loanForm.amount || !loanForm.date) {
      toast.warning("Fadlan buuxi dhammaan goobaha muhiimka ah")
      return
    }

    const selectedCustomer = customers.find((c) => c.id === loanForm.customerId)
    if (!selectedCustomer) {
      toast.warning("Fadlan dooro customer")
      return
    }

    let newLoans: Loan[]
    if (editingLoan) {
      // Logic for updating an existing loan that is being edited
      const loanData: Loan = {
        id: editingLoan.id,
        customerId: loanForm.customerId,
        customerName: selectedCustomer.name,
        description: loanForm.description.trim(),
        amount: Number.parseFloat(loanForm.amount) || 0,
        date: loanForm.date,
        status: editingLoan.status, // Keep original status when editing
        createdAt: editingLoan.createdAt,
      }
      newLoans = loans.map((l) => (l.id === editingLoan.id ? loanData : l))
      toast.success("Deemo waa la cusboonaysiiyay!")
    } else {
      // Logic for adding a new loan
      const newAmount = Number.parseFloat(loanForm.amount) || 0
      const existingPendingLoan = loans.find(
        (l) => l.customerId === loanForm.customerId && l.status === "pending",
      )

      if (existingPendingLoan) {
        // Customer has a pending loan, so add to it without asking
        const updatedLoan = {
          ...existingPendingLoan,
          amount: existingPendingLoan.amount + newAmount,
          description: `${existingPendingLoan.description}\n+ ${loanForm.description.trim()} ($${newAmount.toLocaleString()})`,
          date: loanForm.date, // Update date to the latest transaction
        }
        newLoans = loans.map((l) => (l.id === existingPendingLoan.id ? updatedLoan : l))
        toast.success("Lacagtii waxaa lagu daray deentii hore ee customer-ka!")
      } else {
        // No pending loan, create a new one
        const loanData: Loan = {
          id: Date.now().toString(),
          customerId: loanForm.customerId,
          customerName: selectedCustomer.name,
          description: loanForm.description.trim(),
          amount: newAmount,
          date: loanForm.date,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
        newLoans = [loanData, ...loans]
        toast.success("Deemo cusub waa la diwan geliyay!")
      }
    }

    setLoans(newLoans)
    saveData("loans", newLoans)
    resetLoanForm()
    setIsLoanDialogOpen(false)
  }

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan)
    setLoanForm({
      customerId: loan.customerId,
      description: loan.description,
      amount: loan.amount.toString(),
      date: loan.date,
    })
    setIsLoanDialogOpen(true)
  }

  const handleDeleteLoan = (id: string) => {
    if (confirm("Ma hubtaa in aad rabto in aad tirtirto deemadan?")) {
      const newLoans = loans.filter((l) => l.id !== id)
      const newPayments = payments.filter((p) => p.loanId !== id)

      setLoans(newLoans)
      setPayments(newPayments)
    }
  }

  const resetLoanForm = () => {
    setLoanForm({
      customerId: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    })
    setEditingLoan(null)
  }

  // Payment functions
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return

    const paymentData: Payment = {
      id: Date.now().toString(),
      loanId: selectedLoan.id,
      amount: Number.parseFloat(paymentForm.amount) || 0,
      date: paymentForm.date,
      note: paymentForm.note,
      createdAt: new Date().toISOString(),
    }

    const newPayments = [paymentData, ...payments]
    setPayments(newPayments)

    // Check if loan is fully paid
    const totalPaid = newPayments.filter((p) => p.loanId === selectedLoan.id).reduce((sum, p) => sum + p.amount, 0)

    if (totalPaid >= selectedLoan.amount) {
      updateLoanStatus(selectedLoan.id, "paid")
    }

    resetPaymentForm()
    setIsPaymentDialogOpen(false)
    setSelectedLoan(null)
  }

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  // Utility functions
  const updateLoanStatus = (loanId: string, status: "pending" | "paid" | "overdue") => {
    const newLoans = loans.map((l) => (l.id === loanId ? { ...l, status } : l))
    setLoans(newLoans)
  }

  const getLoanPayments = (loanId: string) => {
    return payments.filter((p) => p.loanId === loanId)
  }

  const getTotalPaid = (loanId: string) => {
    return getLoanPayments(loanId).reduce((sum, p) => sum + p.amount, 0)
  }

  const getRemainingAmount = (loan: Loan) => {
    return loan.amount - getTotalPaid(loan.id)
  }

  const getCustomerLoans = (customerId: string) => {
    return loans.filter((l) => l.customerId === customerId)
  }

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCustomerDetailOpen(true)
  }

  // Export data
  const exportData = () => {
    const data = {
      customers,
      loans,
      payments,
      exportDate: new Date().toISOString(),
      user: user.email,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `loanbook-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export Overdue Loans Report
  const exportOverdueLoansReport = () => {
    const overdueLoans = loans.filter((loan) => loan.status === "overdue")

    if (overdueLoans.length === 0) {
      toast.info("Ma jiraan deemo wakhtigoodii dhaafay (overdue).")
      return
    }

    const headers = [
      "Customer Name",
      "Customer Phone",
      "Customer Address",
      "Loan Description",
      "Total Amount ($)",
      "Remaining Amount ($)",
      "Loan Date",
    ]

    const rows = overdueLoans.map((loan) => {
      const remaining = getRemainingAmount(loan)
      const customer = customers.find((c) => c.id === loan.customerId)
      return [
        `"${loan.customerName.replace(/"/g, '""')}"`,
        `"${customer ? customer.phone.replace(/"/g, '""') : "N/A"}"`,
        `"${customer ? customer.address.replace(/"/g, '""') : "N/A"}"`,
        `"${loan.description.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        loan.amount,
        remaining,
        new Date(loan.date).toLocaleDateString(),
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `overdue-loans-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filter data
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || loan.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalCustomers = customers.length
  const totalLoans = loans.length
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = totalAmount - paidAmount

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "✅ La bixiyay"
      case "overdue":
        return "⚠️ Dhaafay"
      default:
        return "⏳ La sugayo"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💼WaxqabadBOOK</h1>
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                <p>👋 Ahlan {user.fullName}</p>
                <p className="text-xs">📧 {user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="outline" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Ka bax
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">👥 Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Tirada customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">📋 Deemaha</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoans}</div>
              <p className="text-xs text-muted-foreground">Tirada deemaha</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">💰 Wadarta</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Wadarta guud</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">✅ La bixiyay</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Dhammaan bixinaha</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">⏳ La sugayo</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Lacagta la sugayo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">💳 Bixinaha</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">Tirada bixinaha</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Ficil degdeg ah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetCustomerForm()
                    setIsCustomerDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Customer cusub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetLoanForm()
                    setIsLoanDialogOpen(true)
                  }}
                  disabled={customers.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Deemo cusub
                </Button>
                <Button variant="outline" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export xogta
                </Button>
                <Button variant="outline" onClick={exportOverdueLoansReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Warbixinta Deemaha Dhaafay
                </Button>

                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    📊 {loans.filter((l) => l.status === "pending").length} deemo oo la sugayo
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900">
                    💰 ${paidAmount.toLocaleString()} la bixiyay
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900">
                    ⏳ ${pendingAmount.toLocaleString()} la sugayo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">👥 Customers ({totalCustomers})</TabsTrigger>
            <TabsTrigger value="loans">💰 Deemaha ({totalLoans})</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="🔍 Raadi customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCustomerForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Customer cusub
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCustomerSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCustomer ? "✏️ Wax ka bedel customer-ka" : "👥 Diwan geli customer cusub"}
                      </DialogTitle>
                      <DialogDescription>Buuxi macluumaadka customer-ka</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customer-name">👤 Magaca oo dhan</Label>
                        <Input
                          id="customer-name"
                          placeholder="Ahmed Mohamed Ali"
                          value={customerForm.name}
                          onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customer-phone">📞 Telefoonka</Label>
                        <Input
                          id="customer-phone"
                          placeholder="252-61-1234567"
                          value={customerForm.phone}
                          onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customer-address">🏠 Cinwaanka</Label>
                        <Input
                          id="customer-address"
                          placeholder="Hodan, Mogadishu"
                          value={customerForm.address}
                          onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customer-total">💰 Wadarta Guud ($)</Label>
                        <Input
                          id="customer-total"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customerForm.totalAmount}
                          onChange={(e) => setCustomerForm({ ...customerForm, totalAmount: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit">{editingCustomer ? "💾 Cusboonaysii" : "👥 Diwan geli"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Customers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => {
                const customerLoans = getCustomerLoans(customer.id)
                const customerTotalOwed = customerLoans.reduce((sum, loan) => sum + getRemainingAmount(loan), 0)

                return (
                  <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {customer.address}
                        </div>
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">💰 Wadarta:</span>
                          <span className="font-semibold text-lg">${customer.totalAmount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">📋 Deemaha:</span>
                          <Badge variant="outline">{customerLoans.length}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">💸 La rabaa:</span>
                          <span className="font-semibold text-red-600">${customerTotalOwed.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">📅 Diwan gelinta:</span>
                          <span className="text-sm">{new Date(customer.registeredAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between space-x-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => viewCustomerDetails(customer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Customers ma jiraan</h3>
                <p className="text-gray-500 dark:text-gray-400">Bilow customer cusub si aad u bilowdo</p>
              </div>
            )}
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="🔍 Raadi deemo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Xaalada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 Dhammaan</SelectItem>
                  <SelectItem value="pending">⏳ La sugayo</SelectItem>
                  <SelectItem value="paid">✅ La bixiyay</SelectItem>
                  <SelectItem value="overdue">⚠️ Dhaafay</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetLoanForm} disabled={customers.length === 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Deemo cusub
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleLoanSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingLoan ? "✏️ Wax ka bedel deemada" : "💰 Diwan geli deemo cusub"}</DialogTitle>
                      <DialogDescription>Buuxi macluumaadka deemada</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="loan-customer">👤 Dooro customer-ka</Label>
                        <Select
                          value={loanForm.customerId}
                          onValueChange={(value) => setLoanForm({ ...loanForm, customerId: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Dooro customer..." />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {loanForm.customerId &&
                        (() => {
                          const selectedCustomer = customers.find((c) => c.id === loanForm.customerId)
                          if (!selectedCustomer) return null

                          const customerLoans = getCustomerLoans(loanForm.customerId)
                          const totalOutstanding = customerLoans.reduce(
                            (sum, loan) => sum + getRemainingAmount(loan),
                            0,
                          )

                          if (totalOutstanding > 0) {
                            return (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                                  <div>
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                      Deenta Hore: ${totalOutstanding.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                      Customer-kan wuxuu qataa lacag hore ah. Deemada cusub markii la sameeyo waa lagu
                                      dari karaa.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        })()}

                      <div className="grid gap-2">
                        <Label htmlFor="loan-description">📝 Faahfaahin alaabta</Label>
                        <Textarea
                          id="loan-description"
                          placeholder="Tusaale: Baabuur Toyota Camry 2020, Guri 3 qol, iwm..."
                          value={loanForm.description}
                          onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="loan-amount">💰 Lacagta ($)</Label>
                        <Input
                          id="loan-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={loanForm.amount}
                          onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                          required
                        />
                      </div>

                      {loanForm.customerId &&
                        loanForm.amount &&
                        (() => {
                          const selectedCustomer = customers.find((c) => c.id === loanForm.customerId)
                          if (!selectedCustomer) return null

                          const customerLoans = getCustomerLoans(loanForm.customerId)
                          const totalOutstanding = customerLoans.reduce(
                            (sum, loan) => sum + getRemainingAmount(loan),
                            0,
                          )
                          const newAmount = Number.parseFloat(loanForm.amount) || 0

                          if (totalOutstanding > 0 && newAmount > 0) {
                            return (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <p>💰 Deemada cusub: ${newAmount.toLocaleString()}</p>
                                <p>⚠️ Deenta hore: ${totalOutstanding.toLocaleString()}</p>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                  📊 Wadarta guud: ${(newAmount + totalOutstanding).toLocaleString()}
                                </p>
                              </div>
                            )
                          }
                          return null
                        })()}

                      <div className="grid gap-2">
                        <Label htmlFor="loan-date">📅 Taariikhda</Label>
                        <Input
                          id="loan-date"
                          type="date"
                          value={loanForm.date}
                          onChange={(e) => setLoanForm({ ...loanForm, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit">{editingLoan ? "💾 Cusboonaysii" : "💰 Diwan geli"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loans List */}
            <div className="space-y-4">
              {filteredLoans.map((loan) => {
                const totalPaid = getTotalPaid(loan.id)
                const remaining = getRemainingAmount(loan)

                return (
                  <Card key={loan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{loan.customerName}</h3>
                              <p className="text-sm text-gray-500">{loan.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(loan.status)}>{getStatusText(loan.status)}</Badge>
                                {totalPaid > 0 && (
                                  <Badge variant="outline">
                                    💰 ${totalPaid.toLocaleString()} / ${loan.amount.toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg">${loan.amount.toLocaleString()}</p>
                            {remaining > 0 && (
                              <p className="text-sm text-red-600">La rabaa: ${remaining.toLocaleString()}</p>
                            )}
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(loan.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              {loan.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLoan(loan)
                                      resetPaymentForm()
                                      setIsPaymentDialogOpen(true)
                                    }}
                                  >
                                    💰 Bixinta
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => updateLoanStatus(loan.id, "paid")}>
                                    ✅
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateLoanStatus(loan.id, "overdue")}
                                  >
                                    ⚠️
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleEditLoan(loan)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteLoan(loan.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredLoans.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {loans.length === 0 ? "Deemo ma jirto" : "Natiijooyinka raadinta ma jiraan"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {loans.length === 0
                    ? customers.length === 0
                      ? "Marka hore customers diwan geli"
                      : "Bilow deemo cusub si aad u bilowdo"
                    : "Isku day raadin kale ama bedel filter-ka"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Customer Detail Dialog */}
        {/* Enhanced Customer Detail Dialog */}
        <Dialog open={isCustomerDetailOpen} onOpenChange={setIsCustomerDetailOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">👤 {selectedCustomer?.name} - Faahfaahin Dhamaystiran</DialogTitle>
              <DialogDescription>Dhammaan macluumaadka customer-ka iyo deemahooda</DialogDescription>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Macluumaadka Asaasiga ah</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">👤 Magaca</Label>
                        <p className="font-semibold text-lg">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">📞 Telefoonka</Label>
                        <p className="font-medium">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">🏠 Cinwaanka</Label>
                        <p className="font-medium">{selectedCustomer.address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">📅 Diwan gelinta</Label>
                        <p className="font-medium">{new Date(selectedCustomer.registeredAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                {(() => {
                  const customerLoans = getCustomerLoans(selectedCustomer.id)
                  const totalBorrowed = customerLoans.reduce((sum, loan) => sum + loan.amount, 0)
                  const totalPaidByCustomer = customerLoans.reduce((sum, loan) => sum + getTotalPaid(loan.id), 0)
                  const totalRemaining = totalBorrowed - totalPaidByCustomer
                  const paidLoans = customerLoans.filter((loan) => loan.status === "paid").length
                  const pendingLoans = customerLoans.filter((loan) => loan.status === "pending").length
                  const overdueLoans = customerLoans.filter((loan) => loan.status === "overdue").length

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">💰 Koobka Lacagta</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{customerLoans.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">📋 Wadarta Deemaha</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">${totalBorrowed.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">💰 Wadarta Deynta</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">${totalPaidByCustomer.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">✅ La Bixiyay</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">${totalRemaining.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">💸 La Rabaa</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-lg font-bold text-green-600">{paidLoans}</p>
                            <p className="text-xs text-gray-500">✅ La Dhammeeyay</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-lg font-bold text-yellow-600">{pendingLoans}</p>
                            <p className="text-xs text-gray-500">⏳ La Sugayo</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-lg font-bold text-red-600">{overdueLoans}</p>
                            <p className="text-xs text-gray-500">⚠️ Dhaafay</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Detailed Loans List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      📋 Liiska Deemaha ({getCustomerLoans(selectedCustomer.id).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {getCustomerLoans(selectedCustomer.id).map((loan) => {
                        const loanPayments = getLoanPayments(loan.id)
                        const totalPaidForLoan = getTotalPaid(loan.id)
                        const remainingForLoan = getRemainingAmount(loan)

                        return (
                          <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                            {/* Loan Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{loan.description}</h4>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {new Date(loan.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold">${loan.amount.toLocaleString()}</p>
                                <Badge className={getStatusColor(loan.status)}>{getStatusText(loan.status)}</Badge>
                              </div>
                            </div>

                            {/* Payment Progress */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">💰 Bixinta:</span>
                                <span className="text-sm font-bold">
                                  ${totalPaidForLoan.toLocaleString()} / ${loan.amount.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((totalPaidForLoan / loan.amount) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>✅ La bixiyay: ${totalPaidForLoan.toLocaleString()}</span>
                                <span>💸 La rabaa: ${remainingForLoan.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Payment History */}
                            {loanPayments.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">
                                  📝 Taariikhda Bixinta ({loanPayments.length})
                                </h5>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {loanPayments.map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="flex justify-between items-center text-sm bg-white dark:bg-gray-900 p-2 rounded border"
                                    >
                                      <div>
                                        <p className="font-medium">${payment.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(payment.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        {payment.note && (
                                          <p className="text-xs text-gray-600 max-w-32 truncate">{payment.note}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                          {new Date(payment.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              {loan.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLoan(loan)
                                    resetPaymentForm()
                                    setIsPaymentDialogOpen(true)
                                    setIsCustomerDetailOpen(false)
                                  }}
                                >
                                  💰 Bixinta
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleEditLoan(loan)
                                  setIsCustomerDetailOpen(false)
                                }}
                              >
                                ✏️ Wax ka bedel
                              </Button>
                              {loan.status === "pending" && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => updateLoanStatus(loan.id, "paid")}>
                                    ✅ Dhammaystir
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateLoanStatus(loan.id, "overdue")}
                                  >
                                    ⚠️ Dhaafay
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {getCustomerLoans(selectedCustomer.id).length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">💰</div>
                        <p className="text-gray-500">Customer-kan deemo ma laha</p>
                        <Button
                          className="mt-2"
                          size="sm"
                          onClick={() => {
                            setLoanForm({ ...loanForm, customerId: selectedCustomer.id })
                            setIsLoanDialogOpen(true)
                            setIsCustomerDetailOpen(false)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Deemo cusub u samee
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions for Customer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⚡ Ficil Degdeg ah</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setLoanForm({ ...loanForm, customerId: selectedCustomer.id })
                          setIsLoanDialogOpen(true)
                          setIsCustomerDetailOpen(false)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Deemo cusub
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleEditCustomer(selectedCustomer)
                          setIsCustomerDetailOpen(false)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Wax ka bedel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const customerData = {
                            customer: selectedCustomer,
                            loans: getCustomerLoans(selectedCustomer.id),
                            payments: getCustomerLoans(selectedCustomer.id).flatMap((loan) => getLoanPayments(loan.id)),
                            summary: {
                              totalBorrowed: getCustomerLoans(selectedCustomer.id).reduce(
                                (sum, loan) => sum + loan.amount,
                                0,
                              ),
                              totalPaid: getCustomerLoans(selectedCustomer.id).reduce(
                                (sum, loan) => sum + getTotalPaid(loan.id),
                                0,
                              ),
                              totalRemaining: getCustomerLoans(selectedCustomer.id).reduce(
                                (sum, loan) => sum + getRemainingAmount(loan),
                                0,
                              ),
                            },
                            exportDate: new Date().toISOString(),
                          }

                          const blob = new Blob([JSON.stringify(customerData, null, 2)], { type: "application/json" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${selectedCustomer.name.replace(/\s+/g, "_")}-report-${new Date().toISOString().split("T")[0]}.json`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCustomerDetailOpen(false)}>
                🔙 Dib u noqo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handlePaymentSubmit}>
              <DialogHeader>
                <DialogTitle>💰 Ku dar bixinta</DialogTitle>
                <DialogDescription>
                  Bixinta deemada: {selectedLoan?.customerName} - ${selectedLoan?.amount.toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="payment-amount">💰 Lacagta la bixinayo ($)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                  />
                  {selectedLoan && (
                    <p className="text-sm text-gray-500">
                      La rabaa: ${getRemainingAmount(selectedLoan).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment-date">📅 Taariikhda bixinta</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment-note">📝 Qoraal (ikhtiyaari)</Label>
                  <Textarea
                    id="payment-note"
                    placeholder="Faahfaahin dheeraad ah..."
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">💰 Ku dar bixinta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
